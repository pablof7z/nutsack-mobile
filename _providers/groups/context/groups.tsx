import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import NDK, { NDKEvent, NDKKind, NDKRelaySet, NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { useNDK } from '@/ndk-expo';
import { getGroupIdFromEvent } from '@/utils/group';
import { GroupData, groupDataFromEvent, GroupHandle } from './types';

interface GroupsContextType {
    groups: Record<string, GroupData>;
    loadGroups: (groupsData: Array<GroupHandle>, options?: NDKSubscriptionOptions) => void;
    loadAllGroups: (relayUrls: string[], ndk: NDK, options?: NDKSubscriptionOptions) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const useGroups = () => {
    const context = useContext(GroupsContext);
    if (!context) {
        throw new Error('useGroups must be used within a GroupsProvider');
    }
    return context;
};

export const GroupsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [groups, setGroups] = useState<Record<string, GroupData>>({});
    const { ndk, currentUser } = useNDK();

    const eventHandler = useCallback((event: NDKEvent) => {
        const groupId = getGroupIdFromEvent(event);
        if (!groupId) return;

        setGroups((prevGroups) => {
            const updatedGroupData = groupDataFromEvent(event, prevGroups[groupId], currentUser);
            if (!updatedGroupData) return prevGroups;
            return { ...prevGroups, [groupId]: updatedGroupData };
        });
    }, [currentUser]);

    const loadGroups = (groupsData: Array<GroupHandle>, options?: NDKSubscriptionOptions) => {
        if (!ndk) {
            throw new Error('NDK not initialized');
        }

        for (const { groupId, relayUrls } of groupsData) {
            const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);
            const sub = ndk.subscribe([
                { kinds: [NDKKind.GroupMetadata, NDKKind.GroupMembers], "#d": [groupId] },
            ], { groupable: false, ...options}, relaySet, false);
            sub.on('event', (event: NDKEvent) => eventHandler(event));
            sub.start();
        }
    };

    const loadAllGroups = (relayUrls: string[], ndk: NDK, options?: NDKSubscriptionOptions) => {
        console.log('running load all groups')
        const relaySet = NDKRelaySet.fromRelayUrls(relayUrls, ndk);

        const subscription = ndk.subscribe([
            { kinds: [NDKKind.GroupMetadata], limit: 40 },
            { kinds: [NDKKind.GroupMembers], limit: 40 },
        ], { groupable: true, ...options }, relaySet, false);

        subscription.on('event', eventHandler);
        subscription.start();
    };

    useEffect(() => {
        return () => {
            Object.values(groups).forEach((group) => group.sub?.stop());
        };
    }, [groups]);

    return (
        <GroupsContext.Provider value={{ groups, loadGroups, loadAllGroups }}>
            {children}
        </GroupsContext.Provider>
    );
};
