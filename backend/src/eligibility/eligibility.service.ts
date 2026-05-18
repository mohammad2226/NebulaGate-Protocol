import { Injectable, NotFoundException } from '@nestjs/common';
import { PolicyService } from '../policy/policy.service';
import { Policy, PolicyCondition, ConditionType } from '../policy/entities/policy.entity';
import { StellarService } from '../stellar/stellar.service';

export interface EligibilityResult {
  eligible: boolean;
  policyId: string;
  timestamp: number;
  reason?: string;
  conditions: ConditionResult[];
}

export interface ConditionResult {
  condition: PolicyCondition;
  passed: boolean;
  reason?: string;
}

@Injectable()
export class EligibilityService {
  constructor(private policyService: PolicyService, private stellarService: StellarService) {}

  async checkEligibility(wallet: string, policyId: string): Promise<EligibilityResult> {
    let policy: Policy;
    try { policy = await this.policyService.getPolicy(policyId); }
    catch { throw new NotFoundException(`Policy ${policyId} not found`); }

    if (!policy.isActive) {
      return { eligible: false, policyId, timestamp: Date.now(), reason: 'Policy is inactive', conditions: [] };
    }

    const conditions: ConditionResult[] = [];
    for (const condition of policy.conditions) {
      conditions.push(await this.evaluateCondition(wallet, condition));
    }

    const allPassed = policy.logicType === 'AND' 
      ? conditions.every(c => c.passed)
      : conditions.some(c => c.passed);

    return { eligible: allPassed, policyId, timestamp: Date.now(), conditions };
  }

  private async evaluateCondition(wallet: string, condition: PolicyCondition): Promise<ConditionResult> {
    try {
      switch (condition.type) {
        case ConditionType.TOKEN_BALANCE:
          return this.evaluateTokenBalance(wallet, condition);
        case ConditionType.NFT_OWNERSHIP:
          return this.evaluateNftOwnership(wallet, condition);
        case ConditionType.TX_COUNT:
          return this.evaluateTxCount(wallet, condition);
        default:
          return { condition, passed: false, reason: 'Unknown condition type' };
      }
    } catch (e: any) {
      return { condition, passed: false, reason: `Error: ${e.message}` };
    }
  }

  private async evaluateTokenBalance(wallet: string, condition: PolicyCondition): Promise<ConditionResult> {
    if (!condition.asset || !condition.operator || condition.value === undefined) {
      return { condition, passed: false, reason: 'Missing parameters' };
    }
    const balance = await this.stellarService.getTokenBalance(wallet, condition.asset);
    const passed = this.compare(balance, condition.value, condition.operator);
    return { condition, passed, reason: `Balance ${balance} ${condition.operator} ${condition.value}` };
  }

  private async evaluateNftOwnership(wallet: string, condition: PolicyCondition): Promise<ConditionResult> {
    if (!condition.collectionId) return { condition, passed: false, reason: 'Missing collection ID' };
    const hasNft = await this.stellarService.hasNftOwnership(wallet, condition.collectionId);
    return { condition, passed: hasNft, reason: hasNft ? 'User owns NFT' : 'No NFT found' };
  }

  private async evaluateTxCount(wallet: string, condition: PolicyCondition): Promise<ConditionResult> {
    if (!condition.operator || condition.value === undefined) return { condition, passed: false, reason: 'Missing parameters' };
    const txCount = await this.stellarService.getTransactionCount(wallet);
    const passed = this.compare(txCount, condition.value, condition.operator);
    return { condition, passed, reason: `Tx: ${txCount} ${condition.operator} ${condition.value}` };
  }

  private compare(actual: number, expected: number, operator: string): boolean {
    switch (operator) {
      case '>=': return actual >= expected;
      case '>': return actual > expected;
      case '==': return actual === expected;
      case '<=': return actual <= expected;
      case '<': return actual < expected;
      default: return false;
    }
  }
}
