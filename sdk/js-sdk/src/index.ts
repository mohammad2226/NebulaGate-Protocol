import axios, { AxiosInstance } from 'axios';
import {
  Policy,
  CreatePolicyParams,
  AccessToken,
  EligibilityResult,
  MintAccessParams,
  NebulaGateConfig,
} from './types';

export class NebulaGate {
  private client: AxiosInstance;

  constructor(config: NebulaGateConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });
  }

  async createPolicy(params: CreatePolicyParams): Promise<{ policyId: string; policy: Policy }> {
    const { data } = await this.client.post('/policy/create', params);
    return data;
  }

  async getPolicy(policyId: string): Promise<Policy> {
    const { data } = await this.client.get(`/policy/${policyId}`);
    return data.policy;
  }

  async getAllPolicies(): Promise<Policy[]> {
    const { data } = await this.client.get('/policy');
    return data.policies;
  }

  async getPoliciesByCreator(creator: string): Promise<Policy[]> {
    const { data } = await this.client.get(`/policy/creator/${creator}`);
    return data.policies;
  }

  async checkEligibility(wallet: string, policyId: string): Promise<EligibilityResult> {
    const { data } = await this.client.post('/eligibility/check', { wallet, policyId });
    return data;
  }

  async mintAccess(params: MintAccessParams): Promise<{ accessToken: AccessToken; jwt?: string }> {
    const { data } = await this.client.post('/access/mint', params);
    return data;
  }

  async verifyAccess(tokenId: string): Promise<AccessToken> {
    const { data } = await this.client.get(`/access/verify/${tokenId}`);
    return data.token;
  }

  async getAccessTokensByWallet(wallet: string): Promise<AccessToken[]> {
    const { data } = await this.client.get(`/access/wallet/${wallet}`);
    return data.tokens;
  }
}

export default NebulaGate;
