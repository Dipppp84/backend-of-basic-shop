import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductRequestDto } from './dto/product-request.dto';
import { ProductsDto } from './dto/products-limit.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get single Product by id' })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Product was not found' })
  async findById(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get limit of Product starting from skip.' +
      'Use 1 and -1 in order to specify the sorting order where 1 corresponds ' +
      'to the ascending order and -1 corresponds to the descending order.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successful operation',
    type: ProductsDto,
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
  ): Promise<ProductsDto> {
    return this.productService.findAll(limit, skip, sortKey, sortingOrder);
  }

  @Post()
  @ApiOperation({ summary: 'Add new Product' })
  @ApiResponse({
    status: 201,
    description: 'Product is created',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. body does not contain required fields',
  })
  @ApiBody({ type: ProductRequestDto })
  async create(
    @Body() productDto: ProductRequestDto,
  ): Promise<ProductResponseDto> {
    return this.productService.create(productDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update Product information' })
  @ApiResponse({
    status: 200,
    description: 'The Product has been updated',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. ProductId is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Product was not found' })
  @ApiBody({ type: ProductRequestDto })
  update(
    @Param('id') id: string,
    @Body() productDto: ProductRequestDto,
  ): Promise<ProductResponseDto> {
    return this.productService.update(id, productDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Product' })
  @ApiResponse({ status: 204, description: 'Deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Product id is invalid (not ObjectId)',
  })
  @ApiResponse({ status: 404, description: 'Product was not found' })
  delete(@Param('id') id: string): Promise<void> {
    return this.productService.delete(id);
  }
}
