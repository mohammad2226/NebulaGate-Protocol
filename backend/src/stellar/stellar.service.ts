import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server } from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private server: Server;

  constructor(private configService: ConfigService) {
    const horizonUrl = this.configService.get('STELLAR_HORIZON_URL', 'https://horizon.stellar.org');
    this.server = new Server(horizonUrl);
  }

  async getTokenBalance(walletAddress: string, assetCode: string): Promise<number> {
    try {
      const account = await this.server.loadAccount(walletAddress);
      if (assetCode === 'XLM') {
        return Number(account.balances.find(b => b.asset_type === 'native').balance);
      }
      const balance = account.balances.find(b => b.asset_code === assetCode);
      return balance ? Number(balance.balance) : 0;
    } catch { return 0; }
  }

  async hasNftOwnership(walletAddress: string, collectionId: string): Promise<boolean> {
    try {
      const account = await this.server.loadAccount(walletAddress);
      return account.balances.some(b => b.asset_issuer === collectionId);
    } catch { return false; }
  }

  async getTransactionCount(walletAddress: string): Promise<number> {
    try {
      const records = await this.server.payments().forAccount(walletAddress).limit(200).call();
      return records.records.length;
    } catch { return 0; }
  }
}
