import {
  Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, HttpStatus, UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ProductService } from '../persistence/product/product.service';
import { CreateProductDTO, UpdateProductDTO } from 'src/application/dto/product.dto';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/infrastructure/common/cloudinary/cloudinary.service';
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService,
    private readonly cloudinary: CloudinaryService) { }

  @Get('/get-list-product')
  async getListProduct(@Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.productService.getListProduct(+pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list products succesfully")
  }

  @Post('/create-new-product')
  @UseInterceptors(FileInterceptor('file'))
  async createNewProduct(@Body() body: CreateProductDTO, @UploadedFile() file: Express.Multer.File) {
    if (file !== undefined) {
      const { url } = await this.cloudinary.uploadFile(file)
      await this.productService.createNewProduct(body, url)
    } else {
      await this.productService.createNewProduct(body)
    }
    return customResponse(null, HttpStatus.CREATED, "New product added successfully")
  }

  @Post('/upload-product-image/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@Param('id') productId: number, @UploadedFile() file: Express.Multer.File) {
    const data = await this.cloudinary.uploadFile(file)
    await this.productService.uploadProductImage(data, +productId)
    return 'asd'
  }

}


