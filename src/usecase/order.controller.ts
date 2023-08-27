import {
  Controller, Get, Post, Body, Patch, Param, Query, HttpStatus, Res,
} from '@nestjs/common';
import { OrderService } from '../persistence/order/order.service';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';
import { UseGuards } from '@nestjs/common';
import { CreateOrderDTO } from 'src/application/dto/order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/shared/decorators/role.decorator';
import { Role } from 'src/domain/enums/roles.enum';
import { query } from 'express';
@UseGuards(AuthGuard('Jwt'))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Roles(Role.Admin)
  @Get('get-list-order')
  async getListOrder(@Query() query: any) {
    const { orderStatus, pageNumber, pageSize } = query
    const result = await this.orderService.getListOrder(orderStatus, +pageNumber, +pageSize)
    return customResponse(result, HttpStatus.OK, "Get list order successfully")
  }

  @Roles(Role.Admin)
  @Get('get-list-order-by-user-for-admin/:id')
  async getListOrderByUserForAdmin(@Query() query: any, @Param('id') userId: number) {
    const { orderStatus } = query
    const data = await this.orderService.getListOrderByUserForAdmin(+userId, orderStatus)
    return customResponse(data, HttpStatus.OK, "Get list order by user successfully")
  }

  @Get('get-order-by-user/:user_id')
  async getListOrderByUser(@Param('user_id') userId: number, @Query() query: any) {
    const { pageNumber, pageSize } = query
    const data = await this.orderService.getListOrderByUser(+userId, +pageNumber, +pageSize)
    return customResponse(data, HttpStatus.OK, "Get list order by user successfully")
  }


  @Roles(Role.Admin, Role.Shipper)
  @Get('get-list-pending-delivery-order')
  async getListPendingDeliveryOrder(@Query() query: any) {
    const data = await this.orderService.getListPendingDeliveryOrder()
    return customResponse(data, HttpStatus.OK, "Get list order by user successfully")
  }

  @Get('get-order-in-progress/:id')
  async getOrderInProgress(@Param('id') shipperId: number) {
    const result = await this.orderService.getOrderInProgress(+shipperId)
    return customResponse(result, HttpStatus.OK, "Get order in progress successfully")
  }

  @Get('get-order-detail/:id')
  async getOrderDetail(@Param('id') orderId: number) {
    const result = await this.orderService.getOrderDetail(+orderId)
    return customResponse(result, HttpStatus.OK, "Get order detail successfully")
  }

  @Get('get-list-waiting-done-order/:id')
  async getListWaitingDoneOrder(@Param('id') shipperId: number) {
    const data = await this.orderService.getListWaitingDoneOrder(+shipperId)
    return customResponse(data, HttpStatus.OK, "Get list waiting done order successfully")
  }

  @Roles(Role.Admin, Role.Shipper)
  @Get('get-list-done-order/:id')
  async getListDoneOrder(@Param('id') shipperId: number) {
    const data = await this.orderService.getListDoneOrder(+shipperId)
    return customResponse(data, HttpStatus.OK, "Get list done order successfully")
  }

  @Roles(Role.User)
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

  @Roles(Role.Shipper)
  @Post('take-an-order')
  async takeAnOrder(@Query() query: any, @Res() res) {
    try {
      const { shipperId, orderId } = query
      const result = await this.orderService.takeAnOrder(+shipperId, +orderId)
      if (result === HttpStatus.CONFLICT) {
        return res.status(HttpStatus.CONFLICT).send('You have unresolved order')
      } else if (result === HttpStatus.NO_CONTENT) {
        return res.status(HttpStatus.NO_CONTENT).send('The order has been taken by others')
      } else if (result === HttpStatus.OK) {
        return res.status(HttpStatus.OK).send('Order received')
      }
    } catch (error) {
      return customResponse(null, HttpStatus.INTERNAL_SERVER_ERROR, "Backend Error")
    }
  }

  @Post('change-order-status')
  async changeOrderStatus(@Body() body: any) {
    const { order_id, status } = body
    await this.orderService.changeOrderStatus(+order_id, status)
    return customResponse(null, HttpStatus.OK, "Sucessful")
  }

  @Post('cancel-order/')
  async cancelAnOrder(@Body() body: any) {
    const { cancel_reason, order_id } = body
    await this.orderService.cancelAnOrder(+order_id, cancel_reason)
  }

  @Post('dev-send-order')
  async devSendOrder() {
    return await this.orderService.devSendOrder()
  }
}
