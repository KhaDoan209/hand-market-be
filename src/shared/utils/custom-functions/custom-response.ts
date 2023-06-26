export const customResponse = (data: any = null, status: number = null, message: string) => {
   let response = {
      data: data,
      status: status,
      message: message
   }
   return response;
} 