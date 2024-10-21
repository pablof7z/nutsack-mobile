import React, { useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { UserProvider, useUser } from './UserProvider'; // Add this import

interface GroupListItemProps {
    event: NDKEvent;
}

const GroupListItem: React.FC<GroupListItemProps> = ({ event }) => {
    const router = useRouter();  
    const swipeableRef = useRef<Swipeable>(null);
    const pinGroup = () => {}
    const unpinGroup = () => {}
    
    const { userProfile, isLoading, error } = useUser(); // Fetch user profile

    if (isLoading) {
        return <Text>Loading...</Text>; // Handle loading state
    }

    if (error) {
        return <Text>Error: {error.message}</Text>; // Handle error state
    }

    const name = useMemo(() => userProfile?.name, [userProfile?.name]); // Update name
    const avatar = useMemo(() => userProfile?.picture || 'https://via.placeholder.com/50', [userProfile?.picture]); // Update avatar

    const handlePress = () => {
        // router.push({
        //     pathname: '/group/[id]',
        //     params: { id: groupId, relayUrls: relayUrls.join(',') }
        // });
    };

    return (
        <UserProvider>
            <Pressable onPress={handlePress}>
                <View style={styles.container}>
                    <Image source={{ uri: typeof avatar === 'string' ? avatar : undefined }} style={styles.avatar} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.description} numberOfLines={1}>{event.content}</Text>
                    </View>
                </View>
            </Pressable>
        </UserProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#666',
    },
    swipeAction: {
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: 20,
        width: 100,
    },
    swipeActionText: {
        color: 'white',
        fontWeight: 'bold',
    },
    pinnedIndicator: {
        fontSize: 20,
        marginLeft: 10,
    },
});

export default GroupListItem;
