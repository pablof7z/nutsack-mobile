import { getGroupIdFromEvent } from '@/utils/group';
import { NDKSimpleGroupMetadata, NDKSimpleGroupMemberList, NDKEvent, NDKSubscription, NDKUser, NDKKind } from '@nostr-dev-kit/ndk';

export type GroupHandle = {
    groupId: string;
    relayUrls: string[];
}

export interface GroupData {
    groupId: string;
    metadata?: NDKSimpleGroupMetadata;
    members?: NDKSimpleGroupMemberList;
    admins?: NDKSimpleGroupMemberList;
    isMember?: boolean;
    isAdmin?: boolean;
    isPinned?: boolean;
    relayUrls: string[];
}

/**
 * Extracts group data from a given event, updating or creating the GroupData object.
 *
 * @param event - The NDKEvent from which to extract group data.
 * @param prevGroupData - The previous GroupData object to merge with, if available.
 * @param currentUser - The current user, used to determine membership and admin status.
 * @returns The updated GroupData object or undefined if no valid groupId is found.
 */
export function groupDataFromEvent(
    event: NDKEvent,
    prevGroupData?: GroupData,
    currentUser?: NDKUser | null
): GroupData | undefined {
    const groupId = getGroupIdFromEvent(event);
    if (!groupId) return prevGroupData;

    const relayUrl = event.relay?.url;
    const groupData: GroupData = prevGroupData || { groupId, events: [], relayUrls: [] };
    if (relayUrl && groupData.relayUrls.length === 0) groupData.relayUrls = [relayUrl];

    switch (event.kind) {
        case NDKKind.GroupMetadata:
            // ensure we don't overwrite a newer event with an older one
            if (groupData?.metadata && groupData.metadata.created_at! > event.created_at!) return prevGroupData;
            groupData.metadata = NDKSimpleGroupMetadata.from(event);
            break;
        case NDKKind.GroupAdmins:
            // ensure we don't overwrite a newer event with an older one
            if (groupData.admins && groupData.admins.created_at! > event.created_at!) return prevGroupData;
            groupData.admins = NDKSimpleGroupMemberList.from(event);
            if (currentUser) {
                groupData.isAdmin = groupData.admins.memberSet.has(currentUser.pubkey);
            }
            break;
        case NDKKind.GroupMembers:
            // ensure we don't overwrite a newer event with an older one
            if (groupData.members && groupData.members.created_at! > event.created_at!) return prevGroupData;
            groupData.members = NDKSimpleGroupMemberList.from(event);
            if (currentUser) {
                groupData.isMember = groupData.members.memberSet.has(currentUser.pubkey);
            }
            break;
        default:
            groupData.events = [...groupData.events, event];
    }

    return groupData;
}
