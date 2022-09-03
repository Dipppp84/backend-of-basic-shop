import { StatusOrder } from '../schemas/order.schema';
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StatusRequestDto {
  @IsNotEmpty()
  @IsInt()
  @IsEnum(StatusOrder)
  @ApiProperty({ enum: StatusOrder })
  statusOrder: StatusOrder;
}
