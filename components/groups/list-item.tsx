import React, { useRef, useMemo } from 'react';
import { Text, StyleSheet, Image, Pressable } from 'react-native';
import { View } from "@/components/Themed";
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';
import { type GroupData } from '@/_providers/groups/context';

interface GroupListItemProps {
    groupData: GroupData;
}

const GroupListItem: React.FC<GroupListItemProps> = ({ groupData }) => {
    const router = useRouter();  
    const swipeableRef = useRef<Swipeable>(null);
    const pinGroup = () => {}
    const unpinGroup = () => {}
    
    const { metadata, isPinned, groupId, relayUrls, members } = groupData;
    const memberCount = members?.memberSet?.size || 0;

    const name = useMemo(() => metadata!.name || groupId, [metadata?.name]);
    const avatar = useMemo(() => metadata?.picture || 'https://via.placeholder.com/50', [metadata?.picture]);

    const description = useMemo(() => {
        if (!metadata) return '';
        if (metadata.about) return metadata.about;
        if (relayUrls) return relayUrls[0];
        return memberCount ? `${memberCount} members` : '';
    }, [metadata?.about, relayUrls, memberCount]);

    const handlePress = () => {
        console.log("handlePress", { groupId, relayUrls});
        
        router.push({
            pathname: '/group/[id]',
            params: { id: groupId, relayUrls: relayUrls.join(',') }
        });
    };

    const renderRightActions = () => {
        const action = isPinned ? unpinGroup : pinGroup;
        const text = isPinned ? 'Unpin' : 'Pin';
        
        return (
            <Pressable onPress={() => {
                action();
                swipeableRef.current?.close();
            }} style={styles.swipeAction}>
                <Text style={styles.swipeActionText}>{text}</Text>
            </Pressable>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            rightThreshold={40}
        >
            <Pressable onPress={handlePress}>
                <View style={styles.container}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.description} numberOfLines={1}>{description}</Text>
                    </View>
                    {isPinned && <Text style={styles.pinnedIndicator}>📌</Text>}
                </View>
            </Pressable>
        </Swipeable>
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
        borderRadius: 8,
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
