import React, { useState, useMemo, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGroups } from "@/_providers/groups/context";
import { Hexpubkey, NDKEvent, NDKKind, NDKRelaySet, NDKSubscription } from "@nostr-dev-kit/ndk";
import { FlashList } from "@shopify/flash-list";
import UserListItem from "@/components/user/list-item";
import JoinGroupButton from "@/components/groups/button/join-group";
import { GroupData } from "@/_providers/groups/context/types";
import { useNDK } from "@/ndk-expo";

const GroupPage = () => {
    let { id, relayUrls } = useLocalSearchParams()
    const { groups } = useGroups();
    const [group, setGroup] = useState<GroupData | null>(null);
    const { ndk } = useNDK();

    const [eventIds, setEventIds] = useState<Set<string>>(new Set());
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const [eventKinds, setEventKinds] = useState<Set<string>>(new Set());
    let groupSubs: NDKSubscription | undefined;

    useEffect(() => {
        if (!ndk || !group) return;
        if (groupSubs) groupSubs.stop();

        const relaySet = NDKRelaySet.fromRelayUrls(group.relayUrls, ndk);
        groupSubs = ndk.subscribe({ "#h": [group.groupId] },
            { groupable: false }, relaySet, false
        )
        groupSubs.on("event", (event) => {
            if (eventIds.has(event.id)) return;
            setEventIds((eventIds) => new Set([...eventIds, event.id]));
            setEvents((events) => [...events, event]);
            categorizeEventKind(event);
        })
        .start();

        return () => {
            groupSubs?.stop();
        }
    }, [ndk, group]);

    useEffect(() => {
        setGroup(groups[id as string])
    }, [groups, id])

    function categorizeEventKind(event: NDKEvent) {
        let name: string | undefined;
        if (event.kind === 9 || event.kind === 10) name = "Chat";
        else if (event.kind === NDKKind.GroupNote || event.kind === NDKKind.GroupReply) name = "Forum";
        else if (event.kind! >= 9000 && event.kind! <= 9050) return;
        else if (event.kind === NDKKind.Article) name = "Reads";
        if (!name) return;
        setEventKinds((eventKinds) => new Set([...eventKinds, name]));
    }
    
    const colorScheme = useColorScheme();
    const router = useRouter();

    const renderMember = (pubkey: Hexpubkey) => <UserListItem pubkey={pubkey} />

    function renderEventKindBadge(value: string, index: number): React.ReactNode {
        const isSelected = value === "Home";
        return (
            <TouchableOpacity
                key={index}
                style={[
                    styles.badgeContainer,
                    { backgroundColor: colorScheme === "dark" ? "#333333" : "#ccc" },
                    isSelected && styles.selectedBadge,
                ]}
                onPress={() => {
                    if (value === "Chat") {
                        router.push({
                            pathname: `/group/[id]/chat`,
                            params: { id: id as string, relayUrls: relayUrls as string[] },
                        });
                    }
                }}
            >
                <Text
                    style={[
                        styles.badgeText,
                        { color: colorScheme === "dark" ? "#e0e0e0" : "#333" },
                        isSelected && styles.selectedBadgeText,
                    ]}
                >
                    {value}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        (!group) ? (
            <Text>Loading...</Text>
        ) : (
            <View style={styles.container}>
                <Image 
                    source={{ uri: group.metadata?.picture }} 
                    style={[
                        styles.coverImage,
                        { height: 200 }
                    ]} 
                />

                <ScrollView 
                    style={styles.content}
                    contentContainerStyle={{ paddingTop: 200 }}
                >
                    <View style={styles.header}>
                        <Text style={styles.name}>{group.metadata?.name}</Text>
                        <Text style={styles.description}>{group.metadata?.about}</Text>
                        {group.metadata && group.members && (
                            <JoinGroupButton
                                metadata={group.metadata}
                                members={group.members}
                            />
                        )}

                        <ScrollView horizontal style={styles.badgeScrollView}>
                            {renderEventKindBadge("Home", -1)}
                            {Array.from(eventKinds).map((kind, index) => renderEventKindBadge(kind, index))}
                        </ScrollView>
                    </View>

                    <Text style={styles.membersTitle}>Members:</Text>
                    <View style={styles.flashListContainer}>
                        <FlashList
                            data={Array.from(group.members?.memberSet || [])}
                            renderItem={({ item }) => renderMember(item)}
                            keyExtractor={(item) => item}
                            estimatedItemSize={50}
                        />
                    </View>
                </ScrollView>
            </View>
        )
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    coverImage: {
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    content: {
        flex: 1,
    },
    header: {
        alignItems: "center",
        marginBottom: 20,
        paddingHorizontal: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    membersTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    memberItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    badgeContainer: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        marginBottom: 10,
        elevation: 2,
    },
    selectedBadge: {
        backgroundColor: "#007AFF",
    },
    badgeText: {
        fontSize: 14,
        fontWeight: "600",
    },
    selectedBadgeText: {
        color: "#FFFFFF",
    },
    badgeScrollView: {
        flexGrow: 0,
        flex: 1,
        marginBottom: 20,
    },
    flashListContainer: {
        height: 300, // Adjust this value as needed
    },
});

export default GroupPage;
