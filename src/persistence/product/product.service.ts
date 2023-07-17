import { Injectable, Inject } from '@nestjs/common'
import { CreateProductDTO, UpdateProductDTO } from 'src/application/dto/product.dto';
import { Prisma } from '@prisma/client';
import { ProductCache } from 'src/domain/enums/cache.enum';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { ProductRepository } from 'src/application/repositories/business/product.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager/dist';
import { Cache } from 'cache-manager'
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
import { PrismaEnum } from 'src/domain/enums/prisma.enum';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Product } from '@prisma/client';
import { CloudinaryService } from 'src/infrastructure/common/cloudinary/cloudinary.service';
import { getImagePublicId } from 'src/shared/utils/custom-functions/custom-response';
@Injectable()
export class ProductService implements ProductRepository {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache, private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) {
  }

  async getListProduct(pageNumber: number = 1, pageSize: number = 8): Promise<any> {
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

  async getProductDetail(productId: number): Promise<any> {
    const getCache = await this.cache.get(ProductCache.ProductDetail + productId)
    if (getCache) {
      return getCache
    } else {
      const productDetail = await this.prisma.usePrisma().product.findFirst({
        where: {
          id: productId
        }, include: {
          Category: true,
          Discount: true
        }
      })
      await this.cache.set(ProductCache.ProductDetail + productId, productDetail, { ttl: 30 } as any)
      return productDetail
    }

  }

  async getListProductByPurchase(pageNumber: number = 1, pageSize: number = 5): Promise<any> {
    const listProductByPurchase = await this.prisma.usePrisma().product.findMany({
      orderBy: {
        purchase: 'desc'
      },
      include: {
        Discount: true,
        Category: true,
      },
      take: pageSize,
    });
    const totalRecord = Math.ceil(await this.prisma.usePrisma().product.count({
      where: {
        is_deleted: false
      }
    }))
    return getDataByPage(pageNumber, pageSize, totalRecord, listProductByPurchase)
  }

  searchProductByName(name: string): Promise<any> {
    return
  }

  async createNewProduct(body: CreateProductDTO, imageLink: string = ''): Promise<any> {
    const today = new Date();
    const { name, price, description, quantity, brand, category_id, discount_id, type }: any = body
    const newProduct: any = {
      name,
      description,
      brand,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      category_id: parseInt(category_id),
      discount_id: parseInt(discount_id),
      image: imageLink,
      created_at: today.toISOString(),
      type,
    }
    await this.prisma.create(PrismaEnum.Product, newProduct)
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        is_deleted: false
      },
    })
    await this.cache.set(ProductCache.ListProduct, listProduct)
  }

  async updateProductInformation(data: UpdateProductDTO, productId: number): Promise<any> {
    await this.prisma.update(PrismaEnum.Product, productId, data)
    const productDetail = await this.prisma.usePrisma().product.findFirst({
      where: {
        id: productId
      }, include: {
        Category: true,
        Discount: true
      }
    })
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        is_deleted: false
      },
    })
    await this.cache.set(ProductCache.ProductDetail + productId, productDetail, { ttl: 30 } as any)
    return await this.cache.set(ProductCache.ListProduct, listProduct)
  }

  async uploadProductImage(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any> {
    const { url } = data
    const product: Product = await this.prisma.findOne(PrismaEnum.Product, id)
    if (product.image !== '') {
      const publicId = getImagePublicId(product.image)
      console.log(publicId);
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
    const productDetail = await this.prisma.usePrisma().product.findFirst({
      where: {
        id: id
      }, include: {
        Category: true,
        Discount: true
      }
    })
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        is_deleted: false
      },
    })
    await this.cache.set(ProductCache.ProductDetail + id, productDetail, { ttl: 30 } as any)
    return await this.cache.set(ProductCache.ListProduct, listProduct)
  }

  async deleteProduct(productId: number): Promise<any> {
    await this.prisma.delete(PrismaEnum.Product, productId)
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        is_deleted: false
      },
    })
    return await this.cache.set(ProductCache.ListProduct, listProduct)
  }
}
