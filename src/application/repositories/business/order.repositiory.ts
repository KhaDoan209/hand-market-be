import { CreateOrderDTO } from "src/application/dto/order.dto";

export interface OrderRepository {
   getListOrderByUser(userId: number, pageNumber: number, pageSize: number): Promise<any>;
   createNewOrder(data: CreateOrderDTO): Promise<any>;
}