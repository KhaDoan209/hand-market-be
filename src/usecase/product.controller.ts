import {
  Controller, Get, Post, Body, Param, Delete, Query, HttpStatus, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ProductService } from '../persistence/product/product.service';
import { CreateProductDTO, UpdateProductDTO } from 'src/application/dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/infrastructure/common/cloudinary/cloudinary.service';
import { Role } from 'src/domain/enums/roles.enum';
import { Roles } from 'src/shared/decorators/role.decorator';

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

  @Get('/get-product-detail/:id')
  async getProductDetail(@Param('id') productId: number) {
    const data = await this.productService.getProductDetail(+productId)
    return customResponse(data, HttpStatus.OK, "Get product detail successfully")
  }

  @Get('/get-list-product-by-purchase')
  async getListProductByPurchase(@Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.productService.getListProductByPurchase(+pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list product by purchase successfully")
  }

  @Get('/get-list-product-by-discount')
  async getListProductByDiscount(@Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.productService.getListProductByDiscount(+pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list product by discount successfully")
  }

  @Get('/get-list-product-by-category')
  async getListProductByCategory(@Query() query: any) {
    const { category_id, pageNumber, pageSize } = query
    const data = await this.productService.getListProductByCategory(category_id, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list product by category successfully")
  }

  @Post('/create-new-product')
  @UseGuards(AuthGuard('Jwt'))
  @Roles(Role.Admin)
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

  @Post('/update-product-information/:id')
  @UseGuards(AuthGuard('Jwt'))
  @Roles(Role.Admin)
  async uploadProductInformation(@Param('id') productId: number, @Body() body: UpdateProductDTO) {
    const result = await this.productService.updateProductInformation(body, +productId)
    return customResponse(null, HttpStatus.CREATED, 'Update product successfully')
  }

  @Post('/upload-product-image/:id')
  @UseGuards(AuthGuard('Jwt'))
  @Roles(Role.Admin)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(@Param('id') productId: number, @UploadedFile() file: Express.Multer.File) {
    const data = await this.cloudinary.uploadFile(file)
    await this.productService.uploadProductImage(data, +productId)
    return customResponse(null, HttpStatus.OK, "Change image successfully")
  }

  @Delete('/delete-product/:id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard('Jwt'))
  async deleteProduct(@Param('id') productId: number) {
    await this.productService.deleteProduct(+productId)
    return customResponse(null, HttpStatus.OK, "Delete product successfully")
  }

}


