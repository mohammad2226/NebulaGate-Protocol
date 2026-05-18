import axios from 'axios';
import { Policy, CreatePolicyDto, AccessToken, EligibilityResult } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const policyApi = {
  create: async (dto: CreatePolicyDto) => {
    const res = await api.post('/policy/create', dto);
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get(`/policy/${id}`);
    return res.data.policy;
  },
  getAll: async () => {
    const res = await api.get('/policy');
    return res.data.policies;
  },
  getByCreator: async (creator: string) => {
    const res = await api.get(`/policy/creator/${creator}`);
    return res.data.policies;
  },
  disable: async (policyId: string, creator: string) => {
    const res = await api.post('/policy/disable', { policyId, creator });
    return res.data.policy;
  },
};

export const eligibilityApi = {
  check: async (wallet: string, policyId: string): Promise<EligibilityResult> => {
    const res = await api.post('/eligibility/check', { wallet, policyId });
    return res.data;
  },
};

export const accessApi = {
  mint: async (wallet: string, policyId: string, issueJwt?: boolean) => {
    const res = await api.post('/access/mint', { wallet, policyId, issueJwt });
    return res.data;
  },
  verify: async (tokenId: string) => {
    const res = await api.get(`/access/verify/${tokenId}`);
    return res.data.token;
  },
  getByWallet: async (wallet: string) => {
    const res = await api.get(`/access/wallet/${wallet}`);
    return res.data.tokens;
  },
};

export default api;
