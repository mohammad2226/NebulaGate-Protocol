import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessToken } from './entities/access-token.entity';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { EligibilityModule } from '../eligibility/eligibility.module';
import { JwtModule } from '../jwt/jwt.module';
import { PolicyModule } from '../policy/policy.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessToken]), EligibilityModule, JwtModule, PolicyModule],
  providers: [AccessService],
  controllers: [AccessController],
  exports: [AccessService],
})
export class AccessModule {}
