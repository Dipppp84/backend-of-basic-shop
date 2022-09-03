import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

export class OrdersDto {
  @ApiProperty({ type: () => [OrderResponseDto] })
  orders: OrderResponseDto[];
  @ApiProperty()
  limit: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  total: number;
}
