import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { ProductRequestDto } from './dto/product-request.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductsDto } from './dto/products-limit.dto';
import {
  sendConflictRequest,
  sendNotFound,
} from '../common/utils/handler-error';
import { checkId } from '../common/utils/validate';
import { commonFindAll } from '../common/service/service';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findById(id: string): Promise<ProductResponseDto> {
    checkId(id);

    const findProduct = await this.productModel.findById(id).exec();
    if (!findProduct) sendNotFound(`Id: ${id} doesn't exist`);

    return this.convertProductToResDto(findProduct);
  }

  async findAll(
    limit = 5,
    skip = 0,
    sortKey = '_id',
    sortingOrder = 1,
  ): Promise<ProductsDto> {
    const { resLimit, resSkip, sort } = await commonFindAll(
      limit,
      skip,
      sortKey,
      sortingOrder,
    );

    const allProducts = await this.productModel
      .find()
      .sort(sort)
      .limit(resLimit)
      .skip(resSkip)
      .exec();
    const productsReq = await Promise.all(
      allProducts.map((value) => this.convertProductToResDto(value)),
    );

    return {
      products: productsReq,
      skip: skip,
      limit: limit,
      total: await this.count(),
    };
  }

  async create(productReqDto: ProductRequestDto): Promise<ProductResponseDto> {
    await this.checkDuplicateCode(productReqDto.code);

    const product = await this.convertReqDtoToProduct(productReqDto);
    product.createdAt = new Date().getTime();
    product.updatedAt = null;

    const createProduct = new this.productModel(product);
    const saveProduct = await createProduct.save();
    return this.convertProductToResDto(saveProduct);
  }

  async update(
    id: string,
    productReqDto: ProductRequestDto,
  ): Promise<ProductResponseDto> {
    checkId(id);
    await this.checkDuplicateCode(productReqDto.code);

    const product = await this.convertReqDtoToProduct(productReqDto);
    product.updatedAt = new Date().getTime();
    const updateProduct = await this.productModel
      .findOneAndUpdate({ _id: id }, product, { new: true })
      .exec();

    if (!updateProduct) sendNotFound(`Product id: ${id} was not found`);

    return this.convertProductToResDto(updateProduct);
  }

  async delete(id: string): Promise<void> {
    checkId(id);

    const deleteResultPromise = await this.productModel
      .deleteOne({ _id: id })
      .exec();

    if (deleteResultPromise.deletedCount === 0)
      sendNotFound(`Product id: ${id} wasn't found`);
  }

  private async count(): Promise<number> {
    return this.productModel.count().exec();
  }

  private async convertProductToResDto(
    productDoc: ProductDocument,
  ): Promise<ProductResponseDto> {
    return new ProductResponseDto({
      id: productDoc._id,
      name: productDoc.name,
      code: productDoc.code,
      price: productDoc.price,
      description: productDoc.description,
      quantity: productDoc.quantity,
      createdAt: productDoc.createdAt,
      updatedAt: productDoc.updatedAt,
    });
  }

  private async convertReqDtoToProduct(
    productReqDto: ProductRequestDto,
  ): Promise<Product> {
    return new Product({
      name: productReqDto.name,
      code: productReqDto.code,
      price: productReqDto.price,
      description: productReqDto.description,
      quantity: productReqDto.quantity,
    });
  }

  private async checkDuplicateCode(code: string): Promise<void> {
    const userEmail = await this.productModel.findOne({ code: code }).exec();
    if (userEmail) sendConflictRequest('The code has already been taken');
  }

  /**doesn't check anything!*/
  async subtractQuantity(id: string, needSubtract: number): Promise<void> {
    await this.productModel
      .updateOne({ _id: id }, { $inc: { quantity: -needSubtract } })
      .exec();
  }
}
