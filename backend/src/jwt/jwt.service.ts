import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtSession } from './entities/jwt-session.entity';

@Injectable()
export class JwtService {
  constructor(
    private jwtService: NestJwtService,
    @InjectRepository(JwtSession) private jwtSessionRepository: Repository<JwtSession>,
  ) {}

  async issueJwt(wallet: string, policyId: string, expiresInSeconds: number): Promise<string> {
    const payload = { sub: wallet, policyId, iat: Math.floor(Date.now() / 1000) };
    const token = this.jwtService.sign(payload, { expiresIn: expiresInSeconds });

    const now = Math.floor(Date.now() / 1000);
    const jwtSession = this.jwtSessionRepository.create({
      id: uuidv4(), token, wallet, policyId, issuedAt: now, expiresAt: now + expiresInSeconds, isActive: true,
    });
    await this.jwtSessionRepository.save(jwtSession);

    return token;
  }

  async verifyJwt(token: string): Promise<any> {
    try { return this.jwtService.verify(token); }
    catch { throw new Error('Invalid or expired token'); }
  }

  async revokeJwt(token: string): Promise<void> {
    const session = await this.jwtSessionRepository.findOne({ where: { token } });
    if (session) { session.isActive = false; await this.jwtSessionRepository.save(session); }
  }
}
