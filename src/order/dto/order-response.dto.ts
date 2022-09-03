import { ApiProperty } from '@nestjs/swagger';
import { StatusOrder } from '../schemas/order.schema';
import mongoose from 'mongoose';
import { ChosenProduct } from '../class/chosen-products.class';

export class OrderResponseDto {
  constructor(partial: Partial<OrderResponseDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ type: 'ObjectId' })
  id: mongoose.Schema.Types.ObjectId;
  @ApiProperty({ type: String })
  customer: mongoose.Schema.Types.ObjectId | null;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  email: string;
  @ApiProperty({ type: [ChosenProduct] })
  chosenProducts: ChosenProduct[];
  @ApiProperty()
  orderPrice: number;
  @ApiProperty()
  deliveryType: string;
  @ApiProperty()
  deliveryCost: number;
  @ApiProperty()
  deliveryAddress: string;
  @ApiProperty()
  totalPrice: number;
  @ApiProperty()
  updatedAt: number | null;
  @ApiProperty({ enum: StatusOrder })
  statusOrder: StatusOrder;
}
