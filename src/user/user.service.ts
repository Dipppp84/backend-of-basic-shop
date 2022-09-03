import { Inject, Injectable } from '@nestjs/common';
import { Role, User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from './dto/user-response.dto';
import {
  checkId,
  validateEmail,
  validatePassword,
} from '../common/utils/validate';
import {
  sendConflictRequest,
  sendNotFound,
} from '../common/utils/handler-error';
import { UserRequestDto } from './dto/user-request.dto';
import { UsersDto } from './dto/user-limit.dto';
import * as bcrypt from 'bcrypt';
import { ProductService } from '../product/product.service';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { commonFindAll } from '../common/service/service';
import { AddedProductToCart } from '../common/class/added-product.class';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(ProductService) private productService: ProductService,
  ) {}

  async findById(id: string): Promise<UserResponseDto> {
    checkId(id);

    const findUser = await this.userModel.findById(id).exec();
    if (!findUser) sendNotFound(`Id: ${id} doesn't exist`);

    return this.convertUserToResDto(findUser);
  }

  async findAll(
    limit = 5,
    skip = 0,
    sortKey = '_id',
    sortingOrder = 1,
  ): Promise<UsersDto> {
    const { resLimit, resSkip, sort } = await commonFindAll(
      limit,
      skip,
      sortKey,
      sortingOrder,
    );

    const allUsers = await this.userModel
      .find()
      .sort(sort)
      .limit(resLimit)
      .skip(resSkip)
      .exec();
    const usersReq = await Promise.all(
      allUsers.map((value) => this.convertUserToResDto(value)),
    );
    return {
      users: usersReq,
      skip: skip,
      limit: limit,
      total: await this.count(),
    };
  }

  async create(userDto: UserRequestDto): Promise<UserResponseDto> {
    if (!('role' in userDto)) userDto.role = Role.CUSTOMER;

    validateEmail(userDto.email);
    validatePassword(userDto.password);
    await this.checkDuplicateEmail(userDto.email);

    const user = await this.convertReqDtoToUser(userDto);
    user.createdAt = new Date().getTime();
    user.updatedAt = null;
    user.cart = [];
    user.historyOrders = [];

    const createUser = new this.userModel(user);
    const saveUser = await createUser.save();
    return this.convertUserToResDto(saveUser);
  }

  private async count(): Promise<number> {
    return this.userModel.count().exec();
  }

  async update(
    id: string,
    userReqDto: UserRequestDto,
  ): Promise<UserResponseDto> {
    checkId(id);

    validateEmail(userReqDto.email);
    validatePassword(userReqDto.password);
    await this.checkDuplicateEmail(userReqDto.email);

    const user = await this.convertReqDtoToUser(userReqDto);
    user.updatedAt = new Date().getTime();
    const updateProduct = await this.userModel
      .findOneAndUpdate({ _id: id }, user, { new: true })
      .exec();

    if (!updateProduct) sendNotFound(`User id: ${id} was not found`);

    return this.convertUserToResDto(updateProduct);
  }

  async delete(id: string): Promise<void> {
    checkId(id);

    const deleteResultPromise = await this.userModel
      .deleteOne({ _id: id })
      .exec();

    if (deleteResultPromise.deletedCount === 0)
      sendNotFound(`User id: ${id} wasn't found`);
  }

  async setProduct(
    userId: string,
    newProductToCart: AddedProductToCart,
  ): Promise<void> {
    const user: UserResponseDto = await this.findById(userId);
    const product: ProductResponseDto = await this.productService.findById(
      newProductToCart.product.toString(),
    );

    newProductToCart.product = product.id;
    await this.setChosenProductToCart(newProductToCart, user.cart);

    await this.userModel.updateOne({ _id: userId }, { cart: user.cart }).exec();
  }

  /**if product exists set new quantity else push to cart*/
  private async setChosenProductToCart(
    newProductToCart: AddedProductToCart,
    cart: AddedProductToCart[],
  ) {
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].product.toString() === newProductToCart.product.toString()) {
        cart[i].requiredQuantity = newProductToCart.requiredQuantity;
        return;
      }
    }
    cart.push(newProductToCart);
  }

  async removeProduct(userId: string, productId: string): Promise<void> {
    const user: UserResponseDto = await this.findById(userId);

    for (let i = 0; i < user.cart.length; i++)
      if (user.cart[i].product.toString() === productId) {
        user.cart.splice(i, 1);
        await this.userModel
          .updateOne({ _id: userId }, { cart: user.cart })
          .exec();
        return;
      }
    sendNotFound(`productId: ${productId} was not found to cart`);
  }

  async clearProducts(userId: string): Promise<AddedProductToCart[]> {
    const user: UserResponseDto = await this.findById(userId);

    const cart = user.cart;
    await this.userModel.updateOne({ _id: userId }, { cart: [] }).exec();

    return cart;
  }

  private async convertUserToResDto(
    userDocument: UserDocument,
  ): Promise<UserResponseDto> {
    return new UserResponseDto({
      id: userDocument.id,
      email: userDocument.email,
      phone: userDocument.phone,
      createdAt: userDocument.createdAt,
      updatedAt: userDocument.updatedAt,
      role: userDocument.role,
      cart: userDocument.cart,
      historyOrders: userDocument.historyOrders,
    });
  }

  private async convertReqDtoToUser(
    userRequestDto: UserRequestDto,
  ): Promise<User> {
    return new User({
      email: userRequestDto.email,
      password: await this.getPasswordAsHash(userRequestDto.password),
      role: userRequestDto.role,
      phone: userRequestDto.phone,
    });
  }

  private async getPasswordAsHash(password: string): Promise<string> {
    const envCryptoSalt = Number(process.env.CRYPT_SALT);
    if (!envCryptoSalt) throw new Error('CRYPT_SALT was not found');
    const salt = await bcrypt.genSalt(envCryptoSalt);
    return bcrypt.hash(password, salt);
  }

  private async checkDuplicateEmail(email: string): Promise<void> {
    const userEmail = await this.userModel.findOne({ email: email }).exec();
    if (userEmail) sendConflictRequest('The email has already been taken');
  }

  /**doesn't check anything!*/
  async addOrderToHistory(
    userId: string,
    orderId: mongoose.Schema.Types.ObjectId,
  ) {
    await this.userModel
      .updateOne({ _id: userId }, { $push: { historyOrders: orderId } })
      .exec();
  }
}
