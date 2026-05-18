import { create } from 'zustand';

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  publicKey: null,

  connect: async () => {
    try {
      if (typeof window !== 'undefined') {
        const freighter = (window as any).freighter;
        if (freighter) {
          const { isConnected, publicKey } = await freighter.isConnected();
          if (isConnected && publicKey) {
            set({ connected: true, publicKey });
          }
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  },

  disconnect: () => {
    set({ connected: false, publicKey: null });
  },
}));
