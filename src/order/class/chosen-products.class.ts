import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';
import mongoose from 'mongoose';

export class ChosenProduct {
  constructor(
    product: mongoose.Schema.Types.ObjectId,
    quantity: number,
    buyPrice: number,
  ) {
    this.product = product;
    this.quantity = quantity;
    this.totalBuyPrice = buyPrice;
  }

  @ApiProperty({ type: 'ObjectId' })
  @IsNotEmpty()
  @IsMongoId()
  product: mongoose.Schema.Types.ObjectId;
  @ApiProperty()
  @IsInt()
  quantity: number;
  @ApiProperty()
  @IsNumber()
  totalBuyPrice: number;
}
