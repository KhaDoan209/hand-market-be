import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { CategoryService } from '../persistence/category/category.service';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }
  
  @Get('/get-list-category')
  async getListCategory() {
    const data = await this.categoryService.getListCategory()
    return customResponse(data, HttpStatus.OK, "Get list category successfully")
  }

  @Get('/list-product-type/:id')
  async getProductTypes(@Param('id') category_id: number) {
    const data = await this.categoryService.getProductTypes(category_id)
    if (typeof data == 'undefined') {
      return customResponse(data, HttpStatus.NOT_FOUND, "There are no type")
    } else {
      return customResponse(data, HttpStatus.OK, "Get list product types successfully")
    }

  }

  @Get('/count-product-by-category')
  async countProductByCategory() {
    const result = await this.categoryService.countProductByCategory()
    return customResponse(result, HttpStatus.OK, "Count product by category succesfully")
  }
}
