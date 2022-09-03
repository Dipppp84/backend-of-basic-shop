import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersDto } from './dto/user-limit.dto';
import { UserRequestDto } from './dto/user-request.dto';
import { AddedProductToCart } from '../common/class/added-product.class';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Ge User by id' })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'User was not found' })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get limit of User starting from skip.' +
      'Use 1 and -1 in order to specify the sorting order where 1 corresponds ' +
      'to the ascending order and -1 corresponds to the descending order.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: UsersDto,
  })
  @ApiResponse({
    status: 400,
    description: 'limit and skip must be numbers',
  })
  async findAll(
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('sortKey') sortKey?: string,
    @Query('sortingOrder') sortingOrder?: 1 | -1,
  ): Promise<UsersDto> {
    return this.userService.findAll(limit, skip, sortKey, sortingOrder);
  }

  @Put('/setProduct')
  @ApiOperation({ summary: 'Set product to cart of User. (works like Map)' })
  @ApiResponse({
    status: 200,
    description: 'Product was added',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. userId or productId is invalid (not ObjectId)',
  })
  @ApiResponse({
    status: 404,
    description: 'userId or/and productId were not found',
  })
  setProduct(
    @Query('userId') userId: string,
    @Body() newProductToCart: AddedProductToCart,
  ): Promise<void> {
    return this.userService.setProduct(userId, newProductToCart);
  }

  @Delete('/removeProduct')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove product to user's cart" })
  @ApiResponse({
    status: 204,
    description: 'Product was remove',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. userId or productId is invalid (not ObjectId)',
  })
  @ApiResponse({
    status: 404,
    description: 'userId or/and productId were not found',
  })
  removeProduct(
    @Query('userId') userId: string,
    @Query('productId') productId: string,
  ): Promise<void> {
    return this.userService.removeProduct(userId, productId);
  }

  @Get('/clearProducts/:id')
  @ApiOperation({
    summary:
      "Clear the products in the user's cart and return an array of productIds",
  })
  @ApiResponse({
    status: 200,
    description: 'Return an array of ChosenProducts',
    type: [AddedProductToCart],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. userId or productId is invalid (not ObjectId)',
  })
  @ApiResponse({
    status: 404,
    description: 'userId was not found',
  })
  async clearProducts(@Param('id') id: string): Promise<AddedProductToCart[]> {
    return this.userService.clearProducts(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new User' })
  @ApiResponse({
    status: 201,
    description: 'User is created',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. body does not contain required fields',
  })
  @ApiBody({ type: UserRequestDto })
  async create(@Body() userDto: UserRequestDto): Promise<UserResponseDto> {
    return this.userService.create(userDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update User information' })
  @ApiResponse({
    status: 200,
    description: 'The User has been updated',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. User id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'User was not found' })
  @ApiBody({ type: UserRequestDto })
  update(
    @Param('id') id: string,
    @Body() userDto: UserRequestDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, userDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete User' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. User id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'User was not found' })
  delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
