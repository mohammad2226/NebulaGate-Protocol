import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Policy } from './entities/policy.entity';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policy.dto';

@Injectable()
export class PolicyService {
  constructor(@InjectRepository(Policy) private policyRepository: Repository<Policy>) {}

  async createPolicy(dto: CreatePolicyDto): Promise<Policy> {
    const policy = this.policyRepository.create({
      id: uuidv4(),
      creator: dto.creator,
      name: dto.name,
      description: dto.description || '',
      logicType: dto.logicType,
      conditions: dto.conditions,
      expirationSeconds: dto.expirationSeconds || 3600,
      isActive: true,
      metadataUri: dto.metadataUri,
    });
    return this.policyRepository.save(policy);
  }

  async getPolicy(id: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) throw new NotFoundException(`Policy ${id} not found`);
    return policy;
  }

  async getAllPolicies(): Promise<Policy[]> {
    return this.policyRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getPoliciesByCreator(creator: string): Promise<Policy[]> {
    return this.policyRepository.find({ where: { creator }, order: { createdAt: 'DESC' } });
  }

  async updatePolicy(id: string, creator: string, dto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.getPolicy(id);
    if (policy.creator !== creator) throw new ForbiddenException('You can only update your own policies');
    Object.assign(policy, dto);
    return this.policyRepository.save(policy);
  }

  async disablePolicy(id: string, creator: string): Promise<Policy> {
    const policy = await this.getPolicy(id);
    if (policy.creator !== creator) throw new ForbiddenException('You can only disable your own policies');
    policy.isActive = false;
    return this.policyRepository.save(policy);
  }

  async isPolicyActive(id: string): Promise<boolean> {
    const policy = await this.getPolicy(id);
    return policy.isActive;
  }
}
