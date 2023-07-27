import {
  Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, HttpStatus, UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from '../persistence/order/order.service';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { Role } from 'src/domain/enums/roles.enum';
import { Roles } from 'src/shared/decorators/role.decorator';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Get('get-order-by-user/:id')
  async getListOrderByUser(@Param('id') userId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.orderService.getListOrderByUser(+userId, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list order by user successfully")
  }

  @Post('create-new-order')
  async createNewOrder(@Body() body: CreateOrderDTO) {
    const result = await this.orderService.createNewOrder(body)
    if (result === HttpStatus.CREATED) {
      return customResponse(null, HttpStatus.CREATED, "Order has been placed")
    } else {
      return customResponse(null, result, "Failed to create order")
    }
  }


}
