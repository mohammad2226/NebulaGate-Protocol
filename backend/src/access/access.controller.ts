import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AccessService } from './access.service';

@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post('mint')
  async mintAccess(@Body() dto: { wallet: string; policyId: string; issueJwt?: boolean }) {
    const result = await this.accessService.mintAccess(dto.wallet, dto.policyId, dto.issueJwt);
    return { success: true, ...result };
  }

  @Get('verify/:tokenId')
  async verifyAccess(@Param('tokenId') tokenId: string) {
    const token = await this.accessService.verifyAccess(tokenId);
    return { success: true, token };
  }

  @Post('revoke/:tokenId')
  async revokeAccess(@Param('tokenId') tokenId: string) {
    const token = await this.accessService.revokeAccess(tokenId);
    return { success: true, token };
  }

  @Get('wallet/:wallet')
  async getByWallet(@Param('wallet') wallet: string) {
    const tokens = await this.accessService.getTokensByWallet(wallet);
    return { success: true, tokens };
  }

  @Get('policy/:policyId')
  async getByPolicy(@Param('policyId') policyId: string) {
    const tokens = await this.accessService.getTokensByPolicy(policyId);
    return { success: true, tokens };
  }
}
