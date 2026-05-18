import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto, UpdatePolicyDto } from './dto/policy.dto';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Post('create')
  async createPolicy(@Body() dto: CreatePolicyDto) {
    const policy = await this.policyService.createPolicy(dto);
    return { success: true, policyId: policy.id, policy };
  }

  @Get(':id')
  async getPolicy(@Param('id') id: string) {
    const policy = await this.policyService.getPolicy(id);
    return { success: true, policy };
  }

  @Get()
  async getAllPolicies() {
    const policies = await this.policyService.getAllPolicies();
    return { success: true, policies };
  }

  @Get('creator/:creator')
  async getPoliciesByCreator(@Param('creator') creator: string) {
    const policies = await this.policyService.getPoliciesByCreator(creator);
    return { success: true, policies };
  }

  @Put(':id')
  async updatePolicy(@Param('id') id: string, @Body() body: { creator: string } & UpdatePolicyDto) {
    const { creator, ...dto } = body;
    const policy = await this.policyService.updatePolicy(id, creator, dto);
    return { success: true, policy };
  }

  @Post('disable')
  async disablePolicy(@Body() body: { policyId: string; creator: string }) {
    const policy = await this.policyService.disablePolicy(body.policyId, body.creator);
    return { success: true, policy };
  }

  @Get(':id/active')
  async isPolicyActive(@Param('id') id: string) {
    const isActive = await this.policyService.isPolicyActive(id);
    return { success: true, isActive };
  }
}