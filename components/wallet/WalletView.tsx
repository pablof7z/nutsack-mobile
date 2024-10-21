import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { NDKCashuWallet, NDKWalletBalance } from '@nostr-dev-kit/ndk-wallet';
import TransactionHistory from './TransactionHistory';

interface WalletInfoCardProps {
    wallet: NDKCashuWallet;
    onPress: () => void;
    onSend: () => void;
    onReceive: () => void;
}

export default function WalletInfoCard({ wallet, onPress, onSend, onReceive }: WalletInfoCardProps) {
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
        <View style={styles.card}>
            {balances ? (
                balances.map((balance, index) => (
                    <View key={index} style={styles.balanceContainer}>
                        <Text style={styles.balance}>
                            {balance.amount}
                        </Text>
                        <Text style={styles.unit}>
                            {balance.unit}
                        </Text>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={onSend}>
                                <Text style={styles.buttonText}>Send</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={onReceive}>
                                <Text style={styles.buttonText}>Receive</Text>
                            </TouchableOpacity>
                        </View>

                        <TransactionHistory wallet={wallet} />
                    </View>
                ))
            ) : (
                <Text style={styles.balance}>Loading...</Text>
            )}
            
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 16,
        alignItems: 'center', // Center content horizontally
        justifyContent: 'center', // Center content vertically
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
    balanceContainer: {
        alignItems: 'center', // Center balance and unit
    },
    balance: {
        fontSize: 78,
        fontWeight: '800', // Make the balance text bolder
        color: '#000000',
        textAlign: 'center', // Ensure text is centered
    },
    unit: {
        fontSize: 24,
        fontWeight: '300', // Make the unit text slightly bolder
        color: '#000000',
        marginTop: -12,
        textAlign: 'center', // Ensure text is centered
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    button: {
        flex: 1,
        backgroundColor: 'black',
        padding: 16,
        marginHorizontal: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
