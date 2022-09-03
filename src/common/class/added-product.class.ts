import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddedProductToCart {
  constructor(
    product: mongoose.Schema.Types.ObjectId | string,
    quantity: number,
  ) {
    this.product = product;
    this.requiredQuantity = quantity;
  }

  @ApiProperty({ type: 'ObjectId' })
  @IsNotEmpty()
  product: mongoose.Schema.Types.ObjectId | string;
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  requiredQuantity: number;
}
