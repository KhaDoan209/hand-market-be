import { CreateProductDTO, UpdateProductDTO } from "src/application/dto/product.dto";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
export interface ProductRepository {
   getListProduct(pageNumber: number, pageSize: number): Promise<any>;
   getListProductByCategory(category_id?: number, pageNumber?: number, pageSize?: number): Promise<any>;
   getProductDetail(productId: number): Promise<any>;
   getListProductByPurchase(pageNumber?: number, pageSize?: number): Promise<any>
   getListProductByDiscount(pageNumber: number, pageSize: number): Promise<any>
   createNewProduct(body: CreateProductDTO, imageLink: string): Promise<any>
   uploadProductImage(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any>
   searchProductByName(name: string): Promise<any>;
   updateProductInformation(data: UpdateProductDTO, productId: number): Promise<any>;
   deleteProduct(productId: number): Promise<any>

}