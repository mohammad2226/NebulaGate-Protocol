import { Module } from '@nestjs/common';
import { EligibilityService } from './eligibility.service';
import { EligibilityController } from './eligibility.controller';
import { PolicyModule } from '../policy/policy.module';
import { StellarService } from '../stellar/stellar.service';

@Module({
  imports: [PolicyModule],
  providers: [EligibilityService, StellarService],
  controllers: [EligibilityController],
  exports: [EligibilityService],
})
export class EligibilityModule {}
