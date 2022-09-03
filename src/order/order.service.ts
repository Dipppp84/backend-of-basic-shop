import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument, StatusOrder } from './schemas/order.schema';
import { Model } from 'mongoose';
import {
  checkId,
  validateArrAddedProductToCart,
  validateEmail,
  validatePhone,
} from '../common/utils/validate';
import { sendBadRequest, sendNotFound } from '../common/utils/handler-error';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersDto } from './dto/orders-limit.dto';
import { OrderRequestDto } from './dto/order-request.dto';
import { AddedProductToCart } from '../common/class/added-product.class';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { commonFindAll } from '../common/service/service';
import { FilterDto } from '../common/dto/filter.dto';
import { ChosenProduct } from './class/chosen-products.class';
import { ProductResponseDto } from '../product/dto/product-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @Inject(UserService) private userService: UserService,
    @Inject(ProductService) private productService: ProductService,
  ) {}

  async findById(id: string): Promise<OrderResponseDto> {
    checkId(id);

    const findOrder = await this.orderModel.findById(id).exec();
    if (!findOrder) sendNotFound(`Id: ${id} doesn't exist`);

    return this.convertOrderToResDto(findOrder);
  }

  async findAll(
    limit = 5,
    skip = 0,
    sortKey = '_id',
    sortingOrder = 1,
    filter: FilterDto,
  ): Promise<OrdersDto> {
    const { resLimit, resSkip, sort } = await commonFindAll(
      limit,
      skip,
      sortKey,
      sortingOrder,
    );

    const allOrders = await this.orderModel
      .find(filter)
      .sort(sort)
      .limit(resLimit)
      .skip(resSkip)
      .exec();
    const ordersReq = await Promise.all(
      allOrders.map((value) => this.convertOrderToResDto(value)),
    );

    return {
      orders: ordersReq,
      skip: skip,
      limit: limit,
      total: await this.count(filter),
    };
  }

  async create(orderRequestDto: OrderRequestDto): Promise<OrderResponseDto> {
    const order = await this.convertReqDtoToOrder(orderRequestDto);

    order.statusOrder = StatusOrder.IN_PROCESSING;

    const createOrder = new this.orderModel(order);
    const saveOrder = await createOrder.save();

    if (saveOrder.customer)
      await this.userService.addOrderToHistory(
        saveOrder.customer.toString(),
        saveOrder._id,
      );

    return this.convertOrderToResDto(saveOrder);
  }

  async update(
    id: string,
    orderRequestDto: OrderRequestDto,
  ): Promise<OrderResponseDto> {
    checkId(id);

    const order = await this.convertReqDtoToOrder(orderRequestDto);

    order.updatedAt = new Date().getTime();
    const updateOrder = await this.orderModel
      .findOneAndUpdate({ _id: id }, order, { new: true })
      .exec();

    if (!updateOrder) sendNotFound(`Product id: ${id} was not found`);

    return this.convertOrderToResDto(updateOrder);
  }

  async delete(id: string): Promise<void> {
    checkId(id);

    const deleteResultPromise = await this.orderModel
      .deleteOne({ _id: id })
      .exec();

    if (deleteResultPromise.deletedCount === 0)
      sendNotFound(`Order id: ${id} wasn't found`);
  }

  async changeStatus(id: string, statusOrder: StatusOrder): Promise<void> {
    checkId(id);
    const updateOrder = await this.orderModel
      .findOneAndUpdate(
        { _id: id },
        { statusOrder: statusOrder },
        { new: true },
      )
      .exec();

    if (!updateOrder) sendNotFound(`Order id: ${id} was not found`);
  }

  private async count(filter?: FilterDto): Promise<number> {
    return this.orderModel.count(filter).exec();
  }

  private async convertOrderToResDto(
    orderDoc: OrderDocument,
  ): Promise<OrderResponseDto> {
    return new OrderResponseDto({
      id: orderDoc._id,
      customer: orderDoc.customer,
      phone: orderDoc.phone,
      email: orderDoc.email,
      chosenProducts: orderDoc.chosenProducts,
      orderPrice: orderDoc.orderPrice,
      deliveryType: orderDoc.deliveryType,
      deliveryCost: orderDoc.deliveryCost,
      deliveryAddress: orderDoc.deliveryAddress,
      totalPrice: orderDoc.totalPrice,
      updatedAt: orderDoc.updatedAt,
      statusOrder: orderDoc.statusOrder,
    });
  }

  private async convertReqDtoToOrder(
    orderRequestDto: OrderRequestDto,
  ): Promise<Order> {
    //1. validates incoming data and finds entities. (throws errors)
    //check and valid
    validateEmail(orderRequestDto.email);
    validatePhone(orderRequestDto.phone);
    validateArrAddedProductToCart(orderRequestDto.cartOrder);

    let user: UserResponseDto = null;
    if (orderRequestDto.customerId)
      user = await this.userService.findById(orderRequestDto.customerId);

    const mapAddedProd = this.clearDuplicateProduct(orderRequestDto.cartOrder);

    const products: ProductResponseDto[] =
      await this.findAndCheckForExistenceProduct(mapAddedProd);

    //check totalQuantityProduct and quantity addedProduct
    products.forEach((product) => {
      const addedProduct = mapAddedProd.get(product.id.toString());
      if (product.quantity < addedProduct.requiredQuantity)
        sendBadRequest(
          `The total quantity ${product.name} less than the request`,
        );
    });

    //2. calculates the price and subtracts the required quantity
    // from the total quantity of the product.(don't throw error)
    //creat chosenProduct and set totalBuyPrice
    const chosenProducts: ChosenProduct[] = products.map((product) => {
      const addedProductToCart = mapAddedProd.get(product.id.toString());
      return new ChosenProduct(
        product.id,
        addedProductToCart.requiredQuantity,
        addedProductToCart.requiredQuantity * product.price,
      );
    });

    //price all product
    const orderPrice = chosenProducts.reduce(
      (previousValue, currentValue) =>
        previousValue + currentValue.totalBuyPrice,
      0,
    );
    const totalPrice = orderPrice + orderRequestDto.deliveryCost;

    await this.subtractQuantityProducts(chosenProducts);

    return new Order({
      customer: user ? user.id : null,
      phone: orderRequestDto.phone,
      email: orderRequestDto.email,
      chosenProducts: chosenProducts,
      orderPrice: orderPrice,
      deliveryType: orderRequestDto.deliveryType,
      deliveryCost: orderRequestDto.deliveryCost,
      deliveryAddress: orderRequestDto.deliveryAddress,
      totalPrice: totalPrice,
    });
  }

  /**clear possible duplicate products*/
  private clearDuplicateProduct(
    addedProductToCart: AddedProductToCart[],
  ): Map<string, AddedProductToCart> {
    const mapAddedProd = new Map<string, AddedProductToCart>();
    addedProductToCart.forEach((addedProd) =>
      mapAddedProd.set(addedProd.product.toString(), addedProd),
    );
    return mapAddedProd;
  }

  /**subtract quantity products*/
  private async subtractQuantityProducts(
    chosenProducts: ChosenProduct[],
  ): Promise<void> {
    await Promise.all(
      chosenProducts.map((chosenProduct) =>
        this.productService.subtractQuantity(
          chosenProduct.product.toString(),
          chosenProduct.quantity,
        ),
      ),
    );
  }

  private async findAndCheckForExistenceProduct(
    mapAddedProd: Map<string, AddedProductToCart>,
  ): Promise<ProductResponseDto[]> {
    return await Promise.all(
      Array.from(mapAddedProd.keys()).map((id) => {
        return this.productService.findById(id);
      }),
    );
  }
}
