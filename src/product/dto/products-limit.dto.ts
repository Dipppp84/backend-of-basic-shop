import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class ProductsDto {
  @ApiProperty({ type: () => [ProductResponseDto] })
  products: ProductResponseDto[];
  @ApiProperty()
  limit: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  total: number;
}
