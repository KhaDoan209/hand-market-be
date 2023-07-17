import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { DiscountModule } from './discount/discount.module';
import { CategoryModule } from './category/category.module';
@Module({
   imports: [AuthModule, UserModule, ProductModule, DiscountModule, CategoryModule],
   exports: [AuthModule, UserModule, ProductModule, DiscountModule, CategoryModule]
})
export class PersistenceModule { }