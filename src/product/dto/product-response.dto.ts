import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class ProductResponseDto {
  constructor(partial: Partial<ProductResponseDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: 'ObjectId' })
  id: mongoose.Schema.Types.ObjectId;
  @ApiProperty()
  name: string;
  @ApiProperty()
  code: string;
  @ApiProperty()
  price: number;
  @ApiProperty()
  description: string;
  @ApiProperty()
  quantity: number;
  @ApiProperty()
  createdAt: number;
  @ApiProperty()
  updatedAt: number | null;
}
