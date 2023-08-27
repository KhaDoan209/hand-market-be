import { CreateOrderDTO } from "src/application/dto/order.dto";

export interface OrderRepository {
   getListOrder(orderStatus: string, pageNumber: number, pageSize: number): Promise<any>
   getListOrderByUserForAdmin(userId: number, orderStatus: string): Promise<any>;
   getListOrderByUser(userId: number, pageNumber: number, pageSize: number): Promise<any>;
   getOrderInProgress(id: number): Promise<any>;
   getListPendingDeliveryOrder(pageNumber: number, pageSize: number): Promise<any>;
   getListDoneOrder(shipperId: number): Promise<any>;
   getListWaitingDoneOrder(shipperId: number): Promise<any>;
   getOrderDetail(orderId: number): Promise<any>;
   changeOrderStatus(orderId: number, status: string): Promise<any>;
   takeAnOrder(orderId: number, shipperId: number): Promise<any>;
   createNewOrder(data: CreateOrderDTO): Promise<any>;
   cancelAnOrder(orderId: number, cancel_reason: string): Promise<any>;
}