import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { DiscountModule } from './discount/discount.module';
import { CategoryModule } from './category/category.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
@Module({
   imports: [AuthModule, UserModule, ProductModule, DiscountModule, CategoryModule, CartModule, OrderModule],
   exports: [AuthModule, UserModule, ProductModule, DiscountModule, CategoryModule, CartModule, OrderModule]
})
export class PersistenceModule { }