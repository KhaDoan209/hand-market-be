import { CreateCartDTO, UpdateCartDTO } from "src/application/dto/cart.dto";

export interface CartRepository {
   getItemByUser(userId: number, pageNumber: number, pageSize: number): Promise<any>;
   getCartDetail(): Promise<any>;
   addNewItemToCart(data: CreateCartDTO): Promise<any>;
   descreaseItemQuantityInCart(data: CreateCartDTO): Promise<any>;
   removeItemFromCart(data: CreateCartDTO): Promise<any>;
   updateCartInformation(data: UpdateCartDTO): Promise<any>;
   deleteCategory(id: number, action: string): Promise<any>
}