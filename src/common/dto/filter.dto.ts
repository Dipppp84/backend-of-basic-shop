import { ApiProperty } from '@nestjs/swagger';

export class FilterDto {
  @ApiProperty({ type: 'filterValue' })
  filterKey: string;
}
