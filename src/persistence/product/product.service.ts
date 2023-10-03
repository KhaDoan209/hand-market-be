import { Injectable, Inject } from '@nestjs/common'
import { CreateProductDTO, UpdateProductDTO } from 'src/application/dto/product.dto';
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
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from 'src/domain/enums/notification.enum';
import { CreateNotificationDTO } from 'src/application/dto/notification.dto';                                             
@Injectable()
export class ProductService implements ProductRepository {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly notificationService: NotificationService) {
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
        orderBy: {
          created_at: 'asc'
        }
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

  async getListProductByPurchase(pageNumber?: number, pageSize?: number): Promise<any> {
    let result: any
    const totalRecord = Math.ceil(await this.prisma.usePrisma().product.count({
      where: {
        is_deleted: false
      }
    }))
    if (pageNumber && pageSize) {
      result = await this.prisma.usePrisma().product.findMany({
        orderBy: {
          purchase: 'desc'
        },
        include: {
          Discount: true,
          Category: true,
        },
        take: pageSize,
      });
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
    } else {
      result = await this.prisma.usePrisma().product.findMany({
        orderBy: {
          purchase: 'desc'
        },
        include: {
          Discount: true,
          Category: true,
        },
      });
      return getDataByPage(undefined, undefined, totalRecord, result)
    }
  }

  async getListProductByView(pageNumber?: number, pageSize?: number): Promise<any> {
    let result: any
    const totalRecord = Math.ceil(await this.prisma.usePrisma().product.count({
      where: {
        is_deleted: false
      }
    }))
    if (pageNumber && pageSize) {
      result = await this.prisma.usePrisma().product.findMany({
        orderBy: {
          views: 'desc'
        },
        include: {
          Discount: true,
          Category: true,
        },
        take: pageSize,
      });
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
    } else {
      result = await this.prisma.usePrisma().product.findMany({
        orderBy: {
          views: 'desc'
        },
        include: {
          Discount: true,
          Category: true,
        },
      });
      return getDataByPage(undefined, undefined, totalRecord, result)
    }
  }

  async getListProductByDiscount(pageNumber?: number, pageSize?: number): Promise<any> {
    let result: any
    const totalRecord = Math.ceil(await this.prisma.usePrisma().product.count({
      where: {
        Discount: {
          percentage: {
            gt: 0
          }
        }
      }
    }))
    if (pageNumber && pageSize) {
      result = await this.prisma.usePrisma().product.findMany({
        include: {
          Discount: true
        },
        orderBy: {
          Discount: {
            percentage: 'desc'
          }
        }
      });
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
    } else {
      result = await this.prisma.usePrisma().product.findMany({
        include: {
          Discount: true
        },
        orderBy: {
          Discount: {
            percentage: 'desc'
          }
        }
      });
      return getDataByPage(undefined, undefined, totalRecord, result)
    }
  }

  async getListProductByCategory(category_id?: number, pageNumber?: number, pageSize?: number): Promise<any> {
    let result: any
    const totalRecord = await this.prisma.usePrisma().product.count({
      where: {
        category_id: category_id ? category_id : {},
      },
    })
    if (pageNumber && pageSize) {
      result = await this.prisma.usePrisma().product.findMany({
        where: {
          category_id: category_id ? category_id : {},
        },
        include: {
          Category: true
        }
      })
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
    }
    else {
      result = await this.prisma.usePrisma().product.findMany({
        where: {
          category_id: category_id ? category_id : {},
        },
        include: {
          Category: true
        }
      })
      return getDataByPage(undefined, undefined, totalRecord, result)
    }
  }

  async getListProductByType(categoryId: number, types: string[], pageNumber: number, pageSize: number): Promise<any> {
    let result: any
    const totalRecord = await this.prisma.usePrisma().product.count({
      where: {
        category_id: categoryId,
        type: {
          in: types,
        },
      },
    });
    if (pageNumber && pageSize) {
      result = await this.prisma.usePrisma().product.findMany({
        where: {
          category_id: categoryId,
          type: {
            in: types,
          },
        },
      });
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
    }
    else {
      result = await this.prisma.usePrisma().product.findMany({
        where: {
          type: {
            in: types,
          },
        },
      });
      return getDataByPage(undefined, undefined, totalRecord, result)
    }
  }

  async searchProductByName(name: string, pageNumber: number, pageSize: number): Promise<any> {
    const listProduct: any = await this.prisma.usePrisma().$queryRaw`SELECT * FROM "Product"
    WHERE "name" ILIKE '%' || ${name} || '%';`
    return getDataByPage(pageNumber, pageSize, listProduct.length, listProduct)
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
    const createdProduct = await this.prisma.create(PrismaEnum.Product, newProduct)
    const newNotification: CreateNotificationDTO = {
      type: NotificationType.NEW_PRODUCT_AVAILABLE,
      link: createdProduct.id.toString(),
      product_id: createdProduct.id,
      user_id: null,
      order_id: null,
    }
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        is_deleted: false
      },
    })
    await this.cache.set(ProductCache.ListProduct, listProduct)
    await this.notificationService.createNewNotification(newNotification)
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

  async increaseProductView(productId: number): Promise<any> {
    const product = await this.prisma.usePrisma().product.findFirst({
      where: {
        id: productId
      }
    })
    await this.prisma.usePrisma().product.update({
      where: {
        id: productId
      },
      data: {
        views: product.views + 1
      }
    })
    const productDetail = await this.prisma.usePrisma().product.findFirst({
      where: {
        id: productId
      },
      include: {
        Discount: true,
        Category: true,
      }
    })
    return await this.cache.set(ProductCache.ProductDetail + productId, productDetail, { ttl: 30 } as any)
  }

  async arrangeProductByName(category?: number, type?: string[], orderBy: any = 'asc', pageNumber: number = 1, pageSize: number = 8): Promise<any> {
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        category_id: category ? category : {},
        type: type ? {
          in: type
        } : {}
      }, orderBy: {
        name: orderBy
      }
    })
    return getDataByPage(pageNumber, pageSize, listProduct.length, listProduct)
  }

  async arrangeProductByPrice(category: number, type: string[], orderBy: any, pageNumber: number, pageSize: number): Promise<any> {
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        category_id: category ? category : {},
        type: type ? {
          in: type
        } : {}
      },
      orderBy: {
        price: orderBy
      }
    })
    return getDataByPage(pageNumber, pageSize, listProduct.length, listProduct)
  }

  async arrangeProductByView(category: number, type: string[], orderBy: any, pageNumber: number, pageSize: number): Promise<any> {
    const listProduct = await this.prisma.usePrisma().product.findMany({
      where: {
        category_id: category ? category : {},
        type: type ? {
          in: type
        } : {}
      },
      orderBy: {
        views: orderBy
      }
    })
    return getDataByPage(pageNumber, pageSize, listProduct.length, listProduct)
  }
}
