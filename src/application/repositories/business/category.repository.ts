import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { CreateCategoryDTO, UpdateCategoryDTO } from "src/application/dto/category.dto";
export interface CategoryRepository {
   getListCategory(): Promise<any>;
   getCategoryDetail(id: number): Promise<any>;
   getProductTypes(id: number): any;
   countProductByCategory(): Promise<any>;
   createNewCategory(data: CreateCategoryDTO): Promise<any>;
   updateCategoryInformation(data: UpdateCategoryDTO, id: number): Promise<any>;
   uploadCategoryImages(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any>
   deleteCategory(id: number, action: string): Promise<any>
}