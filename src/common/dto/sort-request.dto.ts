import { ApiProperty } from '@nestjs/swagger';

export class SortRequestDto {
  constructor(partial: Partial<SortRequestDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty({
    description:
      'use 1 and -1 in order to specify the sorting order where 1 corresponds to the ascending order and -1 corresponds to the descending order',
  })
  key: number;
}
