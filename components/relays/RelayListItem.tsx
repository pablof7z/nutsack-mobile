import React from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { NDKRelay, NDKRelayStatus } from '@nostr-dev-kit/ndk';

interface RelayItemProps {
    relay: NDKRelay;
}

const RelayStatusIndicator: React.FC<{ status: NDKRelayStatus }> = ({ status }) => {
    const getDotColor = (status: NDKRelayStatus) => {
        switch (status) {
            case NDKRelayStatus.CONNECTED:
                return '#44ff44';
            case NDKRelayStatus.CONNECTING:
                return 'yellow';
            case NDKRelayStatus.DISCONNECTED:
                return 'red';
            case NDKRelayStatus.AUTH_REQUESTED:
                return '#88ff88';
            case NDKRelayStatus.AUTHENTICATED:
                return 'blue';
            case NDKRelayStatus.RECONNECTING:
                return 'orange';
            case NDKRelayStatus.FLAPPING:
                return 'purple';
            default:
                return 'gray';
        }
    };

    return (
        <View style={{ width: 7, height: 7, borderRadius: 7, backgroundColor: getDotColor(status) }} />
    );
};

const RelayItem: React.FC<RelayItemProps> = ({ relay }) => {
    return (
        <View style={styles.container}>
            <RelayStatusIndicator status={relay.status} />
            <Text style={styles.relayUrl}>{relay.url}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // Changed from 'space-between' to 'flex-start'
        padding: 10,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e044',
    },
    relayUrl: {
        flex: 1, // Added to allow the URL to take most of the space
        marginLeft: 10, // Optional: add some space between the status indicator and the URL
    },
});

export default RelayItem;
