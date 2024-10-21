import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useGroups } from "@/_providers/groups/context";
import { Hexpubkey, NDKEvent, NDKKind, NDKRelaySet, NDKSubscription, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { GiftedChat, Bubble, MessageProps, IMessage } from "react-native-gifted-chat";
import { Image } from "react-native";
import { GroupData } from "@/_providers/groups/context/types";
import { useNDK } from "@/ndk-expo";

interface Message {
    _id: string;
    text: string;
    createdAt: Date | number;
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    images?: string[];
}

const GroupChat = () => {
    const { id } = useLocalSearchParams();
    const { ndk } = useNDK();
    const { groups } = useGroups();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userProfiles, setUserProfiles] = useState<Record<Hexpubkey, NDKUserProfile | boolean>>({});
    const [group, setGroup] = useState<GroupData | null>(null);

    const [eventIds, setEventIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!ndk || !groups) return;
        setGroup(groups[id as string])
    }, [ndk, groups, id])

    useEffect(() => {
        if (!group) return;

        const fetchMessages = async () => {
            if (ndk && group.relayUrls) {
                // Use the group's relay URLs from the context
                const relaySet = NDKRelaySet.fromRelayUrls(group.relayUrls, ndk);
                const sub = ndk.subscribe(
                    {
                        kinds: [NDKKind.GroupChat, NDKKind.GroupReply],
                        "#h": [group.groupId],
                    },
                    { groupable: false },
                    relaySet
                );

                sub.on("event", async (event) => {
                    if (eventIds.has(event.id)) return;
                    setEventIds((eventIds) => new Set([...eventIds, event.id]));

                    let profile: NDKUserProfile | false | undefined = userProfiles[event.pubkey];
                    if (profile === undefined) {
                        profile = (await event.author!.fetchProfile()) ?? false;
                        if (profile) {
                            setUserProfiles((prev) => ({ ...prev, [event.pubkey]: profile! }));
                        }
                    }

                    const userData = {
                        _id: event.pubkey,
                        name: profile && profile?.displayName || event.pubkey.slice(0, 8),
                        avatar:
                            profile && profile?.picture || "https://placeimg.com/140/140/any?" + Math.random(),
                    };

                    // Find URLs in content that end with .jpg, .jpeg, or .png
                    const imageRegex = /https?:\/\/.*\.(jpg|jpeg|png)/g;
                    const images = event.content.match(imageRegex) || [];

                    // Remove image URLs from the content
                    const textContent = event.content.replace(imageRegex, "").trim();

                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            _id: event.id + Math.random(),
                            text: textContent,
                            images: images.length > 0 ? images : undefined,
                            createdAt: event.created_at! * 1000,
                            user: {
                                _id: userData._id,
                                name: userData.name,
                                avatar: userData.avatar as string,
                            },
                        },
                    ]);
                });
                sub.start();
            }
        };

        fetchMessages();
        // Set up real-time subscription here
    }, [ndk, group]);

    const sendMessage = async (messages: IMessage[]) => {
        console.log('messages', messages)
        for (const message of messages) {
            const text = message.text.trim();
            console.log("text", text)
            if (ndk && text !== "" && group) {
                const event = new NDKEvent(ndk);
                event.kind = NDKKind.GroupChat;
                event.content = text;
                event.tags = [["h", group.groupId]];

                const relaySet = NDKRelaySet.fromRelayUrls(group.relayUrls, ndk);
                await event.sign();
                console.log("event", event.rawEvent())
                await event.publish(relaySet);
            }
        }
    };

    const parsedPattern = (text: string) => {
        const tesPattern = /Tes[a-zA-Z0-9]+/g;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(new RegExp(`(${tesPattern.source}|${urlPattern.source})`, "g"));

        return (
            <Text>
                {parts.map((part, index) => {
                    if (!part) return null;
                    if (part.match(tesPattern)) {
                        return (
                            <Text key={index} style={{ color: "blue", fontWeight: "bold" }}>
                                {part}
                            </Text>
                        );
                    } else if (part.match(urlPattern)) {
                        return (
                            <Text
                                key={index}
                                style={{ color: "blue", textDecorationLine: "underline" }}
                                onPress={() => Linking.openURL(part)}
                            >
                                {part}
                            </Text>
                        );
                    }
                    return part;
                })}
            </Text>
        );
    };

    const renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}
                renderMessageImage={() => (
                    <View style={styles.imageContainer}>
                        <Text>Images:</Text>
                        {props.currentMessage.images?.map((imageUrl: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: imageUrl }}
                                style={styles.messageImage}
                            />
                        ))}
                    </View>
                )}
            />
        );
    };

    const CustomMessage = ({ currentMessage }: MessageProps<Message>) => {
        if (!currentMessage) return null;

        return (
            <View style={styles.messageContainer}>
                {currentMessage.images && currentMessage.images.length > 0 && (
                    <Image source={{ uri: currentMessage.images[0] }} style={styles.messageImage} />
                )}
                {parsedPattern(currentMessage.text)}
            </View>
        );
    };

    const renderMessage = (props: MessageProps<Message>) => <CustomMessage {...props} />;

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={sendMessage}
                user={{
                    _id: ndk?.activeUser ? ndk.activeUser.pubkey : "unknown",
                }}
                renderBubble={renderBubble}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    chatList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    messageContainer: {
        marginBottom: 12,
        padding: 8,
    },
    messageSender: {
        fontWeight: "bold",
        marginBottom: 4,
    },
    messageContent: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: "row",
        marginTop: 16,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: "#007AFF",
        padding: 8,
        borderRadius: 4,
        justifyContent: "center",
    },
    sendButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    messageImage: {
        width: 150,
        height: 150,
        resizeMode: "cover",
        borderRadius: 8,
        margin: 2,
    },
    imageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        marginBottom: 8,
    },
});

export default GroupChat;
