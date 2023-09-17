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
import { SkipThrottle } from '@nestjs/throttler/dist/throttler.decorator';
@SkipThrottle()
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
    const { categoryId, pageNumber, pageSize } = query
    const data = await this.productService.getListProductByCategory(+categoryId, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list product by category successfully")
  }

  @Get('/get-list-product-by-type')
  async getListProductByType(@Query() query: any) {
    const { categoryId, type, pageNumber, pageSize } = query
    const data = await this.productService.getListProductByType(+categoryId, type, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list product by type sucesfully")
  }

  @Get('/get-list-product-by-view')
  async getListProductByView(@Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.productService.getListProductByView(+ +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list product by view sucesfully")
  }

  @Get('/search-product-by-name')
  async searchProductByName(@Query() query: any) {
    const { name, pageNumber, pageSize } = query
    const data = await this.productService.searchProductByName(name, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Search product by name sucesfully")
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

  @Post('/increase-product-view/:id')
  async increaseProductView(@Param('id') productId: number) {
    await this.productService.increaseProductView(+productId)
    return customResponse(null, HttpStatus.OK, "Increase view successfully")
  }

  @Get('/arrange-product-by-name')
  async arrangeProductByName(@Query() query: any) {
    const { categoryId, type, orderBy, pageNumber, pageSize } = query
    const data = await this.productService.arrangeProductByName(+categoryId, type, orderBy, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Arrange product by name")
  }

  @Get('/arrange-product-by-price')
  async arrangeProductByPrice(@Query() query: any) {
    const { categoryId, type, orderBy, pageNumber, pageSize } = query
    const data = await this.productService.arrangeProductByPrice(+categoryId, type, orderBy, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Arrange product by price")
  }

  @Get('/arrange-product-by-view')
  async arrangeProductByView(@Query() query: any) {
    const { categoryId, type, orderBy, pageNumber, pageSize } = query
    const data = await this.productService.arrangeProductByView(+categoryId, type, orderBy, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Arrange product by price")
  }
}


