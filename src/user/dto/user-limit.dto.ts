import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class UsersDto {
  @ApiProperty({ type: () => [UserResponseDto] })
  users: UserResponseDto[];
  @ApiProperty()
  limit: number;
  @ApiProperty()
  skip: number;
  @ApiProperty()
  total: number;
}
