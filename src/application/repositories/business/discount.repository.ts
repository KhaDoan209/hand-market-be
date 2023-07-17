import { CreateDiscountDTO, UpdateDiscountDTO } from "src/application/dto/discount.dto";
export interface DiscountRepository {
   getListDiscount(): Promise<any>;
   getDiscountDetail(id: number): Promise<any>;
   createNewDiscount(data: CreateDiscountDTO): Promise<any>;
   updateDiscountInformation(data: UpdateDiscountDTO, id: number): Promise<any>;
   deleteDiscount(id: number, action: string): Promise<any>
}