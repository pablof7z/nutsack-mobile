import {create} from 'zustand' // Add Zustand import
import React, { useEffect, useCallback, useState } from 'react'
import { View } from 'react-native'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import { useGroups } from '@/_providers/groups/context'
import { GroupData } from '@/_providers/groups/context/types'
import { useNDK } from '@/ndk-expo'

const GroupLayout = () => {
    let { id, relayUrls } = useLocalSearchParams()
    const { groups } = useGroups();
    const [group, setGroup] = useState<GroupData | null>(null);

    useEffect(() => {
        setGroup(groups[id as string])
    }, [groups, id])

    return (
        <Stack>
            <Stack.Screen 
                name="index" 
                options={{ 
                    headerShown: true, 
                    headerBackVisible: true,
                    headerTransparent: group?.metadata?.picture ? true : false,
                    title: group?.metadata?.picture ? '' : (group?.metadata?.name || 'Group' )
                }} 
                initialParams={{ group }}
            />
            <Stack.Screen name="chat" options={{ headerShown: true, title: "Chat" }} />
        </Stack>
    )
}

export default GroupLayout;

