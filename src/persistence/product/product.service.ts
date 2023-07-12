import { Injectable, Inject } from '@nestjs/common'
import { CreateProductDTO, UpdateProductDTO } from 'src/application/dto/product.dto';
import { ProductCache } from 'src/domain/enums/cache.enum';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { ProductRepository } from 'src/application/repositories/business/product.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist';
import { Cache } from 'cache-manager'
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
import { Prisma } from 'src/domain/enums/prisma.enum';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Product } from '@prisma/client';
import { CloudinaryService } from 'src/infrastructure/common/cloudinary/cloudinary.service';
import { getImagePublicId } from 'src/shared/utils/custom-functions/custom-response';
import { url } from 'inspector';
@Injectable()
export class ProductService implements ProductRepository {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache, private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) {
  }
  async getListProduct(pageNumber: number = 1, pageSize: number = 10): Promise<any> {
    const getCache = await this.cache.get(ProductCache.ListProduct)
    const totalRecord = Math.ceil(await this.prisma.usePrisma().product.count({
      where: {
        is_deleted: false
      }
    }))
    if (getCache) {
      return getDataByPage(pageNumber, pageSize, totalRecord, getCache)
    } else {
      const listProduct = await this.prisma.usePrisma().product.findMany({
        where: {
          is_deleted: false
        },
      })
      await this.cache.set(ProductCache.ListProduct, listProduct)
      return getDataByPage(pageNumber, pageSize, totalRecord, listProduct)
    }
  }
  getListDeletedProduct(pageNumber: number, pageSize: number): Promise<any> {
    return
  }
  getProductDetail(productId: number): Promise<any> {
    return
  }
  searchProductByName(name: string): Promise<any> {
    return
  }

  async createNewProduct(body: CreateProductDTO, imageLink: string = ''): Promise<any> {
    const today = new Date();
    const { name, price, description, quantity, brand, category_id, discount_id }: any = body
    const newProduct: any = {
      name,
      description,
      brand,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category_id: parseInt(category_id),
      discount_id: parseInt(discount_id),
      image: imageLink,
      created_at: today.toISOString()
    }
    await this.prisma.create(Prisma.Product, newProduct)
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        is_deleted: false
      },
    })
    await this.cache.set(ProductCache.ListProduct, listProduct)
  }

  async uploadProductImage(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any> {
    const { url } = data
    const product: Product = await this.prisma.findOne(Prisma.Product, id)
    if (product.image !== null) {
      const publicId = getImagePublicId(product.image)
      await this.cloudinary.deleteFile(publicId)
      await this.prisma.usePrisma().product.update({
        where: {
          id,
        }, data: {
          image: url
        }
      })
    } else {
      await this.prisma.usePrisma().product.update({
        where: {
          id,
        }, data: {
          image: url
        }
      })
    }
    // const userDetailCache = await this.prisma.usePrisma().user.findFirst({
    //   where: {
    //     id,
    //   },
    //   include: {
    //     Address: true,
    //   },
    // })
    // return await this.cache.set(UserCache.UserDetail + id, userDetailCache, { ttl: 30 } as any)
  }



  updateProductInformation(data: UpdateProductDTO, productId: number): Promise<any> {
    return
  }
  restoreProduct(productId: number): Promise<any> {
    return
  }
  deleteProduct(productId: number, action: string): Promise<any> {
    return
  }
}
