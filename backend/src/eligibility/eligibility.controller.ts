import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EligibilityService } from './eligibility.service';

@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Post('check')
  async checkEligibility(@Body() dto: { wallet: string; policyId: string }) {
    const result = await this.eligibilityService.checkEligibility(dto.wallet, dto.policyId);
    return { success: true, ...result };
  }

  @Get('check/:wallet/:policyId')
  async checkEligibilityGet(@Param('wallet') wallet: string, @Param('policyId') policyId: string) {
    const result = await this.eligibilityService.checkEligibility(wallet, policyId);
    return { success: true, ...result };
  }
}
