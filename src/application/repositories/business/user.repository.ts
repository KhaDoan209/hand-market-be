import { UpdateUserDTO, UpdateUserAddressDTO } from "src/application/dto/user.dto";
import { User } from "@prisma/client";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
export interface UserRepository {
   getListUser(pageNumber: number, pageSize: number): Promise<User[]>;
   getListDeletedUser(pageNumber: number, pageSize: number): Promise<any>;
   getUserDetail(id: number): Promise<any>;
   searchUserByEmail(email: string): Promise<any>;
   updateUserInformation(data: UpdateUserDTO, userIdToUpdate: number): Promise<any>;
   updateUserAddress(data: UpdateUserAddressDTO, userIdToUpdate: number): Promise<any>;
   uploadAvatar(data: UploadApiResponse | UploadApiErrorResponse, id: number): Promise<any>
   restoreUserAccount(id: number): Promise<any>
   updateUserRole(id: number, role: string): Promise<any>
   changePassword(id: number, data: string): Promise<any>;
   blockUser(id: number): Promise<any>;
   deleteUser(id: number, action: string): Promise<any>
}