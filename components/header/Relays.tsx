import { useNDK } from "@/ndk-expo";
import { NDKRelay } from '@nostr-dev-kit/ndk';
import React, { useEffect, useState } from 'react';
import { View } from "@/components/Themed";
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const Relays: React.FC = () => {
    const toggleRelays = () => {
        router.push('/setting/relays');
    };

    return (
        <View>
            <TouchableOpacity onPress={toggleRelays}>
                <Ionicons name="ellipsis-vertical" size={24} color="gray" />
            </TouchableOpacity>
        </View>
    );
};

export default Relays;
