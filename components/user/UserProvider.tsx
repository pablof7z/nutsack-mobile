import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NDKUser, NDKUserProfile, Hexpubkey } from '@nostr-dev-kit/ndk';
import { useNDK } from "@/ndk-expo";

interface UserContextType {
  userProfile: NDKUserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  user?: NDKUser;
  pubkey?: Hexpubkey;
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ user, pubkey, children }) => {
  const [ndkUser, setNdkUser] = useState<NDKUser | null>(null);
  const [userProfile, setUserProfile] = useState<NDKUserProfile | null>(null);
  console.log('userProfile state initialized:', userProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const {ndk} = useNDK();

  useEffect(() => {
    if (ndk) {
      if (user) {
        setNdkUser(user);
      } else if (pubkey) {
        setNdkUser(ndk.getUser({ pubkey }));
      } else {
        setError(new Error('Either user or pubkey must be provided'));
        setIsLoading(false);
      }
    }
  }, [user, pubkey, ndk]);

  useEffect(() => {
    if (!ndkUser) return;

    const fetchUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profile = await ndkUser.fetchProfile();
        setUserProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [ndkUser]);

  useEffect(() => {
    console.log('userProfile state updated:', userProfile);
    // existing code...
  }, [userProfile]);

  return (
    <UserContext.Provider value={{ userProfile, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
