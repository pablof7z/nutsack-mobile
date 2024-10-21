import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { NDKCashuWallet, NDKWalletBalance } from '@nostr-dev-kit/ndk-wallet';

interface WalletInfoCardProps {
    wallet: NDKCashuWallet;
    onPress: () => void;
}

export default function WalletInfoCard({ wallet, onPress }: WalletInfoCardProps) {
    const { name } = wallet;
    const [balances, setBalances] = useState<NDKWalletBalance[] | undefined>(undefined);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const walletBalances = await wallet.balance();
                setBalances(walletBalances);
            } catch (error) {
                console.error('Error fetching wallet balance:', error);
                setBalances(undefined);
            }
        };

        fetchBalance();

        // Listen for balance_updated event
        wallet.on('balance_updated', fetchBalance);

        // Cleanup function
        return () => {
            wallet.off('balance_updated', fetchBalance);
        };
    }, [wallet]);

    return (
        <TouchableOpacity onPress={onPress}>
            {balances ? (
                balances.map((balance, index) => (
                    <View key={index} style={styles.balanceContainer}>
                        <Text style={styles.balance}>
                            {balance.amount}
                        </Text>
                        <Text style={styles.unit}>
                            {balance.unit}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={styles.balance}>Loading...</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  balance: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000000',
  },
  unit: {
    fontSize: 24,
    color: '#000000',
    marginTop: 4,
  },
});
