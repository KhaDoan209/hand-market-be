import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService {
   private prisma: PrismaClient;

   constructor() {
      this.prisma = new PrismaClient();
   }
   usePrisma(): PrismaClient {
      return this.prisma;
   }

   async create<T>(model: string, data: T): Promise<T> {
      return this.prisma[model].create({ data });
   }

   async findAll<T>(model: string): Promise<T[]> {
      return this.prisma[model].findMany();
   }

   async findOne<T>(model: string, id: number): Promise<T> {
      return this.prisma[model].findFirst({ where: { id } });
   }

   async update<T>(model: string, id: number, data: Partial<T>): Promise<T> {
      return this.prisma[model].update({ where: { id }, data });
   }

   async delete<T>(model: string, id: number): Promise<T> {
      return this.prisma[model].delete({ where: { id } });
   }
}
