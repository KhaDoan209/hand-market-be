import {
  Controller, Get, Post, Body, Param, Delete, Query, HttpStatus, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common/pipes';
import { CartService } from '../persistence/cart/cart.service';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { CreateCartDTO } from 'src/application/dto/cart.dto';
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Get('/get-item-by-user/:user_id')
  async getItemByUser(@Param('user_id') userId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const result = await this.cartService.getItemByUser(+userId, +pageNumber, +pageSize)
    return customResponse(result, HttpStatus.OK, "Get list item in cart successfully")
  }

  @Post('/add-item-to-cart')
  async addNewItemToCart(@Body(new ValidationPipe()) body: CreateCartDTO) {
    return await this.cartService.addNewItemToCart(body)
  }

  @Post('/decrease-item-quantity')
  async descreaseItemQuantityInCart(@Body(new ValidationPipe()) body: CreateCartDTO) {
    return await this.cartService.descreaseItemQuantityInCart(body)
  }

  @Post('/remove-item-from-cart')
  async removeItemFromCart(@Body(new ValidationPipe()) body: CreateCartDTO) {
    return await this.cartService.removeItemFromCart(body)
  }
}
