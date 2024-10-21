import { StyleSheet, Dimensions } from "react-native";
import { View } from "@/components/Themed";
import { useNDK } from "@/ndk-expo";
import { useState, useEffect } from "react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { FlashList } from "@shopify/flash-list";
import EventCard from "@/components/event/EventCard";

export default function TabTwoScreen() {
    const { ndk } = useNDK();
    const [events, setEvents] = useState<NDKEvent[]>([]);

    useEffect(() => {
        if (ndk) {
            const sub = ndk.subscribe({
                kinds: [NDKKind.Media],
                "#m": ["image/jpeg", "image/png", "image/gif"],
                limit: 100,
            });

            const handleEvent = (event: NDKEvent) => {
                setEvents((prevEvents) => [...prevEvents, event]);
            };

            sub.on("event", handleEvent);

            return () => {
                sub.off("event", handleEvent);
                sub.stop();
            };
        }
    }, [ndk]);

    return (
        <View style={styles.container}>
            <FlashList
                data={events}
                estimatedItemSize={300} // Adjusted for EventCard
                keyExtractor={(item) => item.id}
                renderItem={({ item: event }) => <EventCard event={event} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flashListContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0", // Changed to a light gray background
    },
    flashList: {
        flex: 1,
    },
    flashListContent: {
        paddingVertical: 10,
    },
});
