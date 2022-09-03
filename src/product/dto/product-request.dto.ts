import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/*I3 sOptional Почитать*/
export class ProductRequestDto {
  @IsNotEmpty({})
  @ApiProperty()
  name: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  price: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description: string;
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ApiProperty()
  quantity: number;
}
