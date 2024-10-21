import { StyleSheet } from "react-native";
import { View, Text } from "@/components/Themed";
import { useNDK, useSubscribe } from "@/ndk-expo";
import { useState, useEffect, useMemo } from "react";
import NDK, { Hexpubkey, NDKEvent, NDKKind, NDKList, NDKSubscriptionCacheUsage, NDKUser } from "@nostr-dev-kit/ndk";
import { FlashList } from "@shopify/flash-list";
import GroupListItem from "@/components/groups/list-item";
import { useGroups } from "@/_providers/groups/context";
import { GroupData, GroupHandle } from "@/_providers/groups/context/types";
import UserListItem from "@/components/user/list-item";
import { router } from "expo-router";
import { useNDKSession } from "@/ndk-expo/hooks/session";
import { useDebounce } from "@uidotdev/usehooks";
import TopicListItem from "@/components/topic/list-item";

type UserItem = {
    latestEvent: NDKEvent;
    count: number;
}

type TopicItem = {
    topic: string;
    count: number;
    latestEvent: NDKEvent;
}

export default function Home() {
    // const { ndk, currentUser } = useNDK();
    // const { groups, loadAllGroups } = useGroups();
    // const [sortedGroups, setSortedGroups] = useState<GroupData[]>([]);
    const [userItems, setUserItems] = useState<UserItem[]>([]);
    // const [sortedUserItems, setSortedUserItems] = useState<UserItem[]>([]);
    // const [mergedItems, setMergedItems] = useState<(GroupData | UserItem)[]>([]);
    // const { follows } = useNDKSession();

    const noteFilters = useMemo(() => ([{ kinds: [1] }]), [1]);
    // const opts = useMemo(() => ({ groupable: false, closeOnEose: false, subId: 'all' }), [currentUser]);

    const { events: notes } = useSubscribe({ filters: noteFilters })

    // useEffect(() => {
    //     // const sortedNotes: NDKEvent[] = notes.sort((a, b) => b.created_at! - a.created_at!);
    //     const sortedPubkeys: Array<Hexpubkey> = [];
    //     const map = new Map<string, UserItem>();

    //     for (const note of notes) {
    //         const userItem = map.get(note.pubkey);
    //         if (!userItem) {
    //             map.set(note.pubkey, { latestEvent: note, count: 1 });
    //             sortedPubkeys.push(note.pubkey);
    //         } else {
    //             userItem.count++;
    //             if (note.created_at! > userItem.latestEvent.created_at!) {
    //                 map.set(note.pubkey, { latestEvent: note, count: userItem.count + 1 });
    //             }

    //             map.set(note.pubkey, userItem);
    //         }
    //     }

    //     const userItems = sortedPubkeys.map(pubkey => map.get(pubkey))
    //         .filter(item => item !== undefined) as UserItem[];

    //     setUserItems(userItems);
    // }, [notes])

    // const [topics, setTopics] = useState<TopicItem[]>([]);
    // const [topicMap, setTopicMap] = useState<Map<string, TopicItem>>(new Map());
    // const [hashtagedNoteCount, setHashtagedNoteCount] = useState<number>(0);
    // useEffect(() => {
    //     let count = 0;
    //     const topicsMap = new Map<string, TopicItem>();
    //     for (const note of notes) {
    //         const hashtags = note.getMatchingTags('t').map(tag => tag[1]);
    //         if (hashtags.length <= 3) {
    //             count++;
    //             for (const hashtag of hashtags) {
    //                 const key = hashtag.toLowerCase();
    //                 const topicItem = topicsMap.get(key);
    //                 if (!topicItem) {
    //                     topicsMap.set(key, { topic: hashtag, count: 1, latestEvent: note });
    //                 } else {
    //                     topicItem.count++;
    //                     if (note.created_at! > topicItem.latestEvent.created_at!) {
    //                         topicItem.latestEvent = note;
    //                     }
    //                     topicsMap.set(key, topicItem);
    //                 }
    //             }
    //         }
    //     }

    //     setTopicMap(topicsMap);
    //     setHashtagedNoteCount(count);
    // }, [notes]);

    // useEffect(() => {
    //     const sortedTopics = Array.from(topicMap.entries())
    //         .sort((a, b) => b[1].count - a[1].count)
    //         .map(([topic, topicItem]) => ({ topic, count: topicItem.count, latestEvent: topicItem.latestEvent }));
    //     setTopics(sortedTopics);
    // }, [hashtagedNoteCount]);

    // useEffect(() => {
    //     console.log('2')
    //     if (ndk && currentUser) {
    //         ndk.fetchEvent({
    //             kinds: [NDKKind.SimpleGroupList],
    //             authors: [currentUser.pubkey],
    //         }).then(event => {
    //             if (!event) return;
                
    //             const list = NDKList.from(event);
    //             const handles: GroupHandle[] = [];
    //             for (const tag of list.items) {
    //                 if (tag[0] === "group") {
    //                     handles.push({
    //                         groupId: tag[1],
    //                         relayUrls: tag.slice(2)
    //                     });
    //                 }
    //             }
    //         });
    //     }
    // }, [ndk, currentUser]);

    // useEffect(() => {
    //     if (ndk) {
    //         loadAllGroups([
    //             "wss://groups.fiatjaf.com",
    //             // "wss://groups.0xchat.com",
    //         ], ndk);
    //     }

    //     // Cleanup function to unsubscribe from groups on unmount
    //     // return () => {
    //     //     groupHandles.forEach(handle => unsubscribeGroup(handle.groupId));
    //     // };
    // }, [ndk]);

    // useEffect(() => {
    //     console.log('4')
    //     // Sort groups whenever the groups state changes
    //     const sorted = Object.entries(groups)
    //         .filter(([_, groupData]) => shouldRenderItem([_, groupData]))
    //         // remove groups with no image
    //         .filter(([_, groupData]) => groupData.metadata?.picture !== undefined)
    //         .map(([groupId, groupData]) => groupData);
    //     setSortedGroups(sorted);
    // }, [groups]);

    // const debouncedSortedGroups = useDebounce(sortedGroups, 1000);
    // const debouncedSortedUserItems = useDebounce(userItems, 10);
    // const debouncedTopics = useDebounce(topics, 10);

    // useEffect(() => {
    //     console.log('5')
    //     const mergedItems: (GroupData | UserItem)[] = [];
    //     for (const group of sortedGroups) {
    //         mergedItems.push(group);
    //     }

    //     for (const userItem of sortedUserItems) {
    //         mergedItems.push(userItem);
    //     }
        
    //     setMergedItems(mergedItems);
    // }, [sortedGroups, sortedUserItems]);

    function shouldRenderItem(item: [string, GroupData]) {
        const hasZeroMembers = item[1].members?.members.length === 0;
        return item[1].metadata !== undefined && 
               item[1].metadata.name?.trim() !== '' &&
               !hasZeroMembers;
    }

    function handleUserPress(pubkey: string) {
        router.push({
            pathname: '/user/[id]/chat-view',
            params: { id: pubkey }
        });
    }

    function handleTopicPress(topic: string) {
        router.push({
            pathname: '/topic/[id]/chat-view',
            params: { id: topic }
        });
    }

    function keyExtractor(item: (GroupData | UserItem)) {
        if ((item as GroupData)?.groupId) return (item as GroupData).groupId;
        else if ((item as TopicItem)?.topic) return (item as TopicItem).topic;
        else if ((item as UserItem)?.latestEvent?.id) return (item as UserItem).latestEvent.id;
        return Math.random().toString();
    }

    function renderItem({ item }: { item: (GroupData | UserItem) }) {
        if ((item as GroupData)?.groupId) {
            const groupData = item as GroupData;
            return <GroupListItem groupData={groupData} />
        } else if ((item as TopicItem)?.topic) {
            const topicItem = item as TopicItem;
            return <TopicListItem topic={topicItem.topic} event={topicItem.latestEvent} count={topicItem.count} onPress={() => handleTopicPress(topicItem.topic)} />
        } else if ((item as UserItem)?.latestEvent) {
            const userItem = item as UserItem;
            return <UserListItem pubkey={userItem.latestEvent.pubkey} event={userItem.latestEvent} count={userItem.count} onPress={() => handleUserPress(userItem.latestEvent.pubkey)} />
        }
        return null;
    }

    return (
        <View style={styles.container}>
            <Text>notes = {notes.length}</Text>
            {/* <FlashList
                data={topics}
                estimatedItemSize={300}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flashListContent}
            /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    flashList: {
        flex: 1,
    },
    flashListContent: {
    },
});

