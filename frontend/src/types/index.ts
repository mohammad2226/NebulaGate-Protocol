export interface Policy {
  id: string;
  creator: string;
  name: string;
  description?: string;
  logicType: 'AND' | 'OR';
  conditions: PolicyCondition[];
  expirationSeconds: number;
  isActive: boolean;
  metadataUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyCondition {
  type: 'TOKEN_BALANCE' | 'NFT_OWNERSHIP' | 'TX_COUNT';
  asset?: string;
  collectionId?: string;
  operator?: string;
  value?: number;
}

export interface CreatePolicyDto {
  creator: string;
  name: string;
  description?: string;
  logicType: 'AND' | 'OR';
  conditions: PolicyCondition[];
  expirationSeconds?: number;
  metadataUri?: string;
}

export interface AccessToken {
  id: string;
  wallet: string;
  policyId: string;
  issuedAt: number;
  expiresAt: number;
  isActive: boolean;
  revokedAt?: string;
  createdAt: string;
}

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
