import { Role } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { AddedProductToCart } from '../../common/class/added-product.class';

export class UserResponseDto {
  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: 'ObjectId' })
  id: mongoose.Schema.Types.ObjectId;
  @ApiProperty()
  email: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  createdAt: number;
  @ApiProperty()
  updatedAt: number | null;
  @ApiProperty({ enum: Role })
  role: Role;
  @ApiProperty({ type: [AddedProductToCart] })
  cart: AddedProductToCart[];
  @ApiProperty({ type: [String] })
  historyOrders: mongoose.Schema.Types.ObjectId[];
  @ApiProperty({ type: [String] })
  historyOfAddedProducts: mongoose.Schema.Types.ObjectId[];
}
