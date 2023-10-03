import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { DiscountService } from '../persistence/discount/discount.service';
import { customResponse } from 'src/shared/utils/custom-functions/custom-response';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) { }

  @Get('/get-list-discount')
  async getListDiscount() {
    const data = await this.discountService.getListDiscount();
    return customResponse(data, HttpStatus.OK, "Get list discount successfully");
  }

}
