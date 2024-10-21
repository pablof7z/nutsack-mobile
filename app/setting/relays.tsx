import { useNDK } from "@/ndk-expo";
import { NDKRelay } from '@nostr-dev-kit/ndk';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import RelayList from '@/components/relays/RelayList';

const Relays: React.FC = () => {
    return (
        <View>
            <RelayList />
        </View>
    );
};

export default Relays;
