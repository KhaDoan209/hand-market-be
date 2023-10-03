import { Injectable } from '@nestjs/common';
import { PrismaEnum } from 'src/domain/enums/prisma.enum';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { CategoryRepository } from 'src/application/repositories/business/category.repository';
import { CreateCategoryDTO, UpdateCategoryDTO } from 'src/application/dto/category.dto';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { ListProductTypes } from 'src/domain/enums/product-types.enum';
@Injectable()
export class CategoryService implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {
  }

  async getListCategory() {
    return await this.prisma.usePrisma().category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  }
  async getProductTypes(id: number): Promise<any> {
    return ListProductTypes.find(item => {
      if (item.category_id === Number(id)) {
        return item.types_list
      }
    })
  }
  async countProductByCategory(): Promise<any> {
    const result = await this.prisma.usePrisma().category.findMany({
      include: {
        Product: true
      }
    })
    const categoryCounts = result.map(category => ({
      id: category.id,
      name: category.name,
      productCount: category.Product.length
    }));
    return categoryCounts
  }
  async getCategoryDetail(id: number): Promise<any> {
    return
  }
  async createNewCategory(data: CreateCategoryDTO): Promise<any> {
    return
  }
  async updateCategoryInformation(data: UpdateCategoryDTO, id: number): Promise<any> {
    return
  }
  async uploadCategoryImages(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any> {
    return
  }
  async deleteCategory(id: number, action: string): Promise<any> {
    return
  }

}
