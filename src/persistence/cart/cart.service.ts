import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { CartRepository } from 'src/application/repositories/business/cart.repository';
import { CreateCartDTO, UpdateCartDTO } from 'src/application/dto/cart.dto';
import { getDataByPage } from 'src/shared/utils/custom-functions/custom-response';
@Injectable()
export class CartService implements CartRepository {
   constructor(@Inject(CACHE_MANAGER) private cache: Cache, private readonly prisma: PrismaService) {
   }

   async getItemByUser(userId: number, pageNumber: number = 1, pageSize: number = 8): Promise<any> {
      const result = await this.prisma.usePrisma().cart.findMany({
         where: {
            user_id: userId
         }, include: {
            Product: {
               include: {
                  Discount: true,
               }
            }
         }, orderBy: {
            id: 'asc'
         }
      })
      const totalRecord = Math.ceil(await this.prisma.usePrisma().cart.count({
         where: {
            user_id: userId
         },
      }))
      return getDataByPage(pageNumber, pageSize, totalRecord, result)
   }

   getCartDetail(): Promise<any> {
      return
   }
   async addNewItemToCart(data: CreateCartDTO): Promise<any> {
      const { user_id, product_id } = data
      const today = new Date();
      const isItemExisted = await this.prisma.usePrisma().cart.findFirst({
         where: {
            user_id,
            product_id,
         }
      })
      if (isItemExisted) {
         await this.prisma.usePrisma().cart.update({
            where: {
               id: isItemExisted.id
            }, data: {
               item_quantity: isItemExisted.item_quantity + 1
            }
         })
      } else {
         await this.prisma.usePrisma().cart.create({
            data: {
               ...data, item_quantity: 1, created_at: today.toISOString()
            }
         })
      }

   }

   async descreaseItemQuantityInCart(data: CreateCartDTO): Promise<any> {
      const { user_id, product_id } = data
      const isItemExisted = await this.prisma.usePrisma().cart.findFirst({
         where: {
            user_id,
            product_id,
         }
      })
      if (isItemExisted) {
         if (isItemExisted.item_quantity > 1) {
            await this.prisma.usePrisma().cart.update({
               where: {
                  id: isItemExisted.id
               }, data: {
                  item_quantity: isItemExisted.item_quantity - 1
               }
            })
         } else {
            await this.prisma.usePrisma().cart.delete({
               where: {
                  id: isItemExisted.id
               }
            })
         }
      }
   }

   async removeItemFromCart(data: CreateCartDTO): Promise<any> {
      const { user_id, product_id } = data
      const isItemExisted = await this.prisma.usePrisma().cart.findFirst({
         where: {
            user_id,
            product_id,
         }
      })
      return await this.prisma.usePrisma().cart.delete({
         where: {
            id: isItemExisted.id
         }
      })

   }

   updateCartInformation(data: UpdateCartDTO): Promise<any> {
      return
   }
   deleteCategory(id: number, action: string): Promise<any> {
      return
   }
}
