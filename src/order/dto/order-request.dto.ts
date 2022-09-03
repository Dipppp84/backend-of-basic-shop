import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { AddedProductToCart } from '../../common/class/added-product.class';

export class OrderRequestDto {
  @ApiProperty({ type: 'ObjectId' })
  @ValidateIf((_, value) => value !== null)
  customerId: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phone: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ApiProperty({ type: [AddedProductToCart] })
  cartOrder: AddedProductToCart[];
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  deliveryType: string;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  deliveryCost: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  deliveryAddress: string;
}
