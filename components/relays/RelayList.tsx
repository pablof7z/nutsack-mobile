import { useNDK } from "@/ndk-expo";
import { NDKRelay } from '@nostr-dev-kit/ndk';
import React, { useEffect, useState } from 'react';
import { View, Text } from "@/components/Themed";
import RelayListItem from './RelayListItem';
import { FlatList } from 'react-native';
import { FlashList } from '@shopify/flash-list';

const RelayList: React.FC = () => {
    const { ndk } = useNDK();
    const [relays, setRelays] = useState<NDKRelay[]>([]);

    useEffect(() => {
        if (ndk) {
            function updateRelays() { if (ndk) setRelays(Array.from(ndk.pool.relays.values())); }
            ndk.pool.on('relay:ready', updateRelays);
            ndk.pool.on('relay:disconnect', updateRelays);
            updateRelays();
        }
    }, [ndk]);

    return (
        <View style={{ width: '100%', height: '100%'}}>
            <FlatList
                data={relays}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <RelayListItem relay={item} />
                )}
            />
        </View>
    );
};

export default RelayList; // Updated export
