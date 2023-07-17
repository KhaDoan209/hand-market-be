import { Injectable } from '@nestjs/common';
import { PrismaEnum } from 'src/domain/enums/prisma.enum';
import { PrismaService } from 'src/infrastructure/config/prisma/prisma/prisma.service';
import { DiscountRepository } from 'src/application/repositories/business/discount.repository';
import { CreateDiscountDTO, UpdateDiscountDTO } from 'src/application/dto/discount.dto';
@Injectable()
export class DiscountService implements DiscountRepository {
  constructor(private readonly prisma: PrismaService) {

  }

  async getListDiscount(): Promise<any> {
    return await this.prisma.findAll(PrismaEnum.Discount)
  }
  getDiscountDetail(id: number): Promise<any> {
    return
  }
  createNewDiscount(data: CreateDiscountDTO): Promise<any> {
    return
  }
  updateDiscountInformation(data: UpdateDiscountDTO, id: number): Promise<any> {
    return
  }
  deleteDiscount(id: number, action: string): Promise<any> {
    return
  }
}
