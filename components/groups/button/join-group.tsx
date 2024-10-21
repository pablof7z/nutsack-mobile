import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native'
import { NDKSimpleGroupMetadata, NDKSimpleGroupMemberList } from "@nostr-dev-kit/ndk"
import { NDKEvent, NDKKind, NDKRelaySet } from "@nostr-dev-kit/ndk"
import { router } from 'expo-router'
import { useNDK } from '@/ndk-expo'

interface JoinGroupButtonProps {
    metadata: NDKSimpleGroupMetadata
    members: NDKSimpleGroupMemberList | undefined
    onPress?: () => void
}

const JoinGroupButton: React.FC<JoinGroupButtonProps> = ({ metadata, members, onPress }: JoinGroupButtonProps) => {
    const { ndk } = useNDK()
    const isMember = ndk?.activeUser && members?.memberSet.has(ndk.activeUser.pubkey)
    const groupId = metadata.dTag;
    const relaySet = new NDKRelaySet([metadata.relay], ndk);

    if (isMember) return null

    const buttonText = metadata.access === 'open' ? 'Join' : 'Request to Join'

    const handleJoinGroup = async () => {
        if (!ndk?.signer) {
            router.push('/login')
            return;
        }

        const joinEvent = new NDKEvent(ndk, {
            kind: NDKKind.GroupAdminRequestJoin,
            content: "I want to join this group",
            tags: [["h", groupId]]
        })
        joinEvent.publish(relaySet)

        if (onPress) {
            onPress()
        }
    }

    return (
        <TouchableOpacity 
            style={[styles.button]} 
            onPress={handleJoinGroup}
        >
            <Text style={[styles.buttonText]}>
                {buttonText}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: 'red',
        width: Dimensions.get('window').width - 32,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 16,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: 'gray',
    },
    disabledButtonText: {
        color: '#ccc',
    },
})

export default JoinGroupButton
