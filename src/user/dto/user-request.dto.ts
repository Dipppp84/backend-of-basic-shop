import { Role } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';

export class UserRequestDto extends RegisterUserDto {
  @IsNotEmpty()
  @IsInt()
  @IsEnum(Role)
  @ApiProperty({ enum: Role })
  role: Role;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone: string;
}
