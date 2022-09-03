import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ChosenProduct } from '../class/chosen-products.class';

export type OrderDocument = Order & Document;

@Schema({ versionKey: false, id: true })
export class Order {
  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }

  @Prop({ required: true })
  phone: string;
  @Prop({ required: true })
  email: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  customer: mongoose.Schema.Types.ObjectId | null;
  @Prop()
  chosenProducts: ChosenProduct[];
  @Prop()
  orderPrice: number;
  @Prop()
  deliveryType: string;
  @Prop()
  deliveryCost: number;
  @Prop()
  deliveryAddress: string;
  @Prop()
  totalPrice: number;
  @Prop()
  updatedAt: number | null;
  @Prop()
  statusOrder: StatusOrder;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

export enum StatusOrder {
  IN_PROCESSING,
  PROCESSED,
  CANCELED,
}
