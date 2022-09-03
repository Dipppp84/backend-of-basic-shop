import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AddedProductToCart } from '../../common/class/added-product.class';

export type UserDocument = User & Document;

@Schema({ versionKey: false, id: true })
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  phone: string;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number | null;
  @Prop()
  role: Role;
  @Prop()
  cart: AddedProductToCart[];
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] })
  historyOrders: mongoose.Schema.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export enum Role {
  CUSTOMER,
  ADMIN,
}
