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
import { OrderService } from './order.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrdersDto } from './dto/orders-limit.dto';
import { OrderRequestDto } from './dto/order-request.dto';
import { StatusRequestDto } from './dto/status-request.dto';
import { FilterDto } from '../common/dto/filter.dto';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/findAll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Get limit of User starting from skip.' +
      'Use 1 and -1 in order to specify the sorting order where 1 corresponds ' +
      'to the ascending order and -1 corresponds to the descending order. ' +
      'Use FilterDto object to filter key : value',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: OrdersDto,
  })
  @ApiResponse({
    status: 400,
    description: 'limit and skip must be numbers',
  })
  async findAll(
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('sortKey') sortKey: string,
    @Query('sortingOrder') sortingOrder: 1 | -1,
    @Body() filter: FilterDto,
  ): Promise<OrdersDto> {
    return this.orderService.findAll(
      limit,
      skip,
      sortKey,
      sortingOrder,
      filter,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single Order by id' })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Order was not found' })
  async findById(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.orderService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Add new Order' })
  @ApiResponse({
    status: 201,
    description: 'Order is created',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. body does not contain required fields',
  })
  @ApiBody({ type: OrderRequestDto })
  async create(
    @Body() orderRequestDto: OrderRequestDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.create(orderRequestDto);
  }

  @Post('/status/:id')
  @ApiOperation({ summary: 'Change status' })
  @ApiResponse({
    status: 201,
    description: 'Status is changed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. OrderId is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Order was not found' })
  @ApiBody({ type: StatusRequestDto })
  async changeStatus(
    @Param('id') id: string,
    @Body() statusRequestDto: StatusRequestDto,
  ): Promise<void> {
    return this.orderService.changeStatus(id, statusRequestDto.statusOrder);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Order information' })
  @ApiResponse({
    status: 200,
    description: 'The Order has been updated',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. OrderId is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Product was not found' })
  @ApiBody({ type: OrderRequestDto })
  update(
    @Param('id') id: string,
    @Body() orderRequestDto: OrderRequestDto,
  ): Promise<OrderResponseDto> {
    return this.orderService.update(id, orderRequestDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Order' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Product id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Order was not found' })
  delete(@Param('id') id: string): Promise<void> {
    return this.orderService.delete(id);
  }
}
