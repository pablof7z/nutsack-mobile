import { useLocalSearchParams } from 'expo-router';
import { View, Text } from '@/components/Themed';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNDK } from "@/ndk-expo";
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

const UserChatViewPage = () => {
    const { id } = useLocalSearchParams();
    const [messages, setMessages] = useState<IMessage[]>([]);
    const { ndk, currentUser } = useNDK();

    function eventHandler(event: NDKEvent) {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                _id: event.id,
                text: event.content,
                createdAt: event.created_at! * 1000,
                user: {
                    _id: event.pubkey,
                    name: event.pubkey.slice(0, 8), // Adjust as needed
                    avatar: "https://placeimg.com/140/140/any?" + Math.random(),
                },
            },
        ]);
    }

    useEffect(() => {
        if (!ndk || !currentUser || !id) return;

        const sub = ndk.subscribe([
            { kinds: [1], authors: [id as string], limit: 10 },
            { kinds: [1], authors: [currentUser.pubkey], "#p": [id as string], limit: 10 }
        ]);
        sub.on("event", eventHandler);

        return () => {
            sub.stop();
        }
    }, [ndk, currentUser]);

    const sendMessage = async (newMessages: IMessage[]) => {
        for (const message of newMessages) {
            const text = message.text.trim();
            if (ndk && text !== "") {
                const event = new NDKEvent(ndk);
                event.kind = 1; // Adjust kind as needed
                event.content = text;
                await event.sign();
                await event.publish();
            }
        }
    };

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={sendMessage}
                user={{
                    _id: ndk?.activeUser ? ndk.activeUser.pubkey : "unknown",
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});

export default UserChatViewPage;