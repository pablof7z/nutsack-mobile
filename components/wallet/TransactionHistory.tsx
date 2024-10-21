import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { NDKCashuWallet, NDKWalletChange } from '@nostr-dev-kit/ndk-wallet';
import { NDKEvent, NDKKind, NDKSubscription } from '@nostr-dev-kit/ndk';
import { useNDK } from "@/ndk-expo";

interface TransactionHistoryProps {
    wallet: NDKCashuWallet;
}

const TransactionHistory = ({ wallet }: TransactionHistoryProps) => {
    const { ndk, currentUser } = useNDK();
    const [transactions, setTransactions] = useState<NDKEvent[]>([]);
    const [knownEventIds, setKnownEventIds] = useState(new Set());
    let sub: NDKSubscription;

    const handleEvent = async (event: NDKEvent) => {
        if (knownEventIds.has(event.id)) return;

        const change = await NDKWalletChange.from(event);
        if (!change) {
            console.log('change event didnt parse', JSON.stringify(event.rawEvent(), null, 4));
            return;
        }
        setKnownEventIds(new Set([...knownEventIds, change.id]));
        setTransactions(prev => [...prev, change]);
    }

    useEffect(() => {
        if (ndk && currentUser) {
            sub = ndk.subscribe({
                kinds: [7376],
                authors: [currentUser.pubkey],
            }, {
                groupable: false,
                closeOnEose: false
            });
            sub.on("event", handleEvent);
            sub.start();
        }

        return () => sub.stop();

    }, [ndk, currentUser]);

    const renderItem = ({ item }) => (
        <Text>
            {item.direction === 'in' ? 'Deposit' : 'Payment'}: ${item.amount}
        </Text>
    );

    return (
        <View>
            <Text>Transaction History</Text>
            <Text>{transactions.length}</Text>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    );
};

export default TransactionHistory;
