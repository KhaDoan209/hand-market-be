import {
  Controller, Get, Post, Body, Patch, Param, Query, HttpStatus,
} from '@nestjs/common';
import { OrderService } from '../persistence/order/order.service';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { UseGuards } from '@nestjs/common';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('Jwt'))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get('get-order-by-user/:user_id')
  async getListOrderByUser(@Param('user_id') userId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.orderService.getListOrderByUser(+userId, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list order by user successfully")
  }

  @Post('create-new-order')
  async createNewOrder(@Body() body: CreateOrderDTO) {
    try {
      const result = await this.orderService.createNewOrder(body)
      if (result === HttpStatus.CREATED) {
        return customResponse(null, HttpStatus.CREATED, "Order has been placed")
      } else {
        return result
      }
    } catch (error) {
      return customResponse(null, HttpStatus.INTERNAL_SERVER_ERROR, "Backend error")
    }
  }


}
