import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ versionKey: false, id: true })
export class Product {
  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }

  @Prop({ required: true })
  name: string;
  @Prop()
  code: string;
  @Prop()
  price: number;
  @Prop()
  description: string;
  @Prop()
  quantity: number;
  @Prop()
  createdAt: number;
  @Prop()
  updatedAt: number | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
