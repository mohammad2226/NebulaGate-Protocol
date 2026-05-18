import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AccessToken } from './entities/access-token.entity';
import { EligibilityService } from '../eligibility/eligibility.service';
import { JwtService } from '../jwt/jwt.service';
import { PolicyService } from '../policy/policy.service';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(AccessToken) private accessTokenRepository: Repository<AccessToken>,
    private eligibilityService: EligibilityService,
    private jwtService: JwtService,
    private policyService: PolicyService,
  ) {}

  async mintAccess(wallet: string, policyId: string, issueJwt: boolean = false) {
    const policy = await this.policyService.getPolicy(policyId);
    if (!policy.isActive) throw new BadRequestException('Policy is not active');

    const eligibility = await this.eligibilityService.checkEligibility(wallet, policyId);
    if (!eligibility.eligible) throw new BadRequestException('User is not eligible');

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + policy.expirationSeconds;

    const accessToken = this.accessTokenRepository.create({
      id: uuidv4(), wallet, policyId, issuedAt: now, expiresAt, isActive: true,
    });
    await this.accessTokenRepository.save(accessToken);

    let jwt: string | undefined;
    if (issueJwt) jwt = await this.jwtService.issueJwt(wallet, policyId, policy.expirationSeconds);

    return { accessToken, jwt };
  }

  async verifyAccess(tokenId: string): Promise<AccessToken> {
    const token = await this.accessTokenRepository.findOne({ where: { id: tokenId } });
    if (!token) throw new NotFoundException(`Access token ${tokenId} not found`);
    if (!token.isActive) throw new BadRequestException('Token revoked');
    if (token.expiresAt < Math.floor(Date.now() / 1000)) throw new BadRequestException('Token expired');
    return token;
  }

  async revokeAccess(tokenId: string): Promise<AccessToken> {
    const token = await this.accessTokenRepository.findOne({ where: { id: tokenId } });
    if (!token) throw new NotFoundException(`Access token ${tokenId} not found`);
    token.isActive = false;
    token.revokedAt = new Date();
    return this.accessTokenRepository.save(token);
  }

  async getTokensByWallet(wallet: string): Promise<AccessToken[]> {
    return this.accessTokenRepository.find({ where: { wallet }, order: { createdAt: 'DESC' } });
  }

  async getTokensByPolicy(policyId: string): Promise<AccessToken[]> {
    return this.accessTokenRepository.find({ where: { policyId }, order: { createdAt: 'DESC' } });
  }
}
