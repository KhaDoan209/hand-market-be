import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { DiscountModule } from './discount/discount.module';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';
@Module({
   imports: [AuthModule, UserModule, ProductModule, DiscountModule, CategoryModule, CartModule],
   exports: [AuthModule, UserModule, ProductModule, DiscountModule, CategoryModule, CartModule]
})
export class PersistenceModule { }