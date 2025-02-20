import React, { createContext, useContext, useState, useEffect } from 'react';
import NDKWalletService, { NDKWallet } from '@nostr-dev-kit/ndk-wallet';
import { useNDK } from '@/ndk-expo';

interface NDKWalletContextType {
  walletService: NDKWalletService | null;
  wallets: NDKWallet[];
  defaultWallet: NDKWallet | null;
}

const NDKWalletContext = createContext<NDKWalletContextType>({
  walletService: null,
  wallets: [],
  defaultWallet: null,
});

export const useNDKWallet = () => useContext(NDKWalletContext);

export const NDKWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletService, setWalletService] = useState<NDKWalletService | null>(null);
  const [wallets, setWallets] = useState<NDKWallet[]>([]);
  const [defaultWallet, setDefaultWallet] = useState<NDKWallet | null>(null);
  const { ndk, currentUser } = useNDK();

  useEffect(() => {
    console.log('wallet provider', { ndk: !!ndk, signer: !!ndk?.signer, currentUser: !!currentUser})
    
    if (ndk && currentUser) {
      const initWalletService = async () => {
        try {
            console.log("starting ndk wallet service", ndk.signer, currentUser.npub)
          const service = new NDKWalletService(ndk);
          setWalletService(service);

          service.on("ready", () => {
            console.log("wallet service ready", service.wallets.length)
            setWallets(service.wallets)
          })

          service.on('wallet', (wallet: NDKWallet) => {
            console.log('wallet', wallet);
            setWallets(prevWallets => [...prevWallets, wallet]);
          });

          service.on('wallet:default', (wallet: NDKWallet) => {
            console.log('default wallet', wallet);
            setDefaultWallet(wallet);
          });

          service.start(currentUser);
        } catch (error) {
          console.error('Failed to initialize NDKWalletService:', error);
        }
      };

      initWalletService();
    } else {
      setWalletService(null);
      setWallets([]);
      setDefaultWallet(null);
    }

    return () => {
      if (walletService) {
        walletService.removeAllListeners();
        // walletService.stop();
      }
    };
  }, [ndk, currentUser]);

  return (
    <NDKWalletContext.Provider value={{ walletService, wallets, defaultWallet }}>
      {children}
    </NDKWalletContext.Provider>
  );
};
