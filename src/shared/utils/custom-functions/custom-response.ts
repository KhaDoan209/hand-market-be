export const customResponse = (data: any = null, status: number = null, message: string) => {
   let response = {
      data: data,
      status: status,
      message: message
   }
   return response;
}

export const getDataByPage = (pageNumber: number, pageSize: number, totalRecords: number, data: any) => {
   const startIndex = (pageNumber - 1) * pageSize;
   const endIndex = startIndex + pageSize;
   const pageData = data.slice(startIndex, endIndex);
   const totalPages = data.length > 0 ? Math.ceil(totalRecords / pageSize) : 0;

   let response = {
      pageSize,
      firstPage: 1,
      lastPages: totalPages,
      totalPages: totalPages,
      totalRecords,
      currentPage: pageNumber,
      nextPage: pageNumber + 1,
      previousPage: pageNumber > 1 ? pageNumber - 1 : 1,
      data: pageData
   }
   return response
}

