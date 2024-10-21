import { StyleSheet, Dimensions } from "react-native";
import { View } from "@/components/Themed";
import { useNDK } from "@/ndk-expo";
import { useState, useEffect, useRef, useCallback } from "react";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { FlashList } from "@shopify/flash-list";
import { Video, AVPlaybackStatus } from "expo-av";

export default function TabTwoScreen() {
    const { ndk } = useNDK();
    const [events, setEvents] = useState<NDKEvent[]>([]);
    const videoRefs = useRef<{ [key: string]: Video | null }>({});

    useEffect(() => {
        if (ndk) {
            const sub = ndk.subscribe({
                kinds: [NDKKind.VerticalVideo],
                limit: 50,
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

    const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
        changed.forEach((item) => {
            const video = videoRefs.current[item.item.id];
            if (video) {
                if (item.isViewable) {
                    video.playAsync();
                } else {
                    video.pauseAsync();
                }
            }
        });
    }, []);

    return (
        <View style={styles.container}>
            <FlashList
        data={events}
        estimatedItemSize={Dimensions.get('window').width}
        keyExtractor={(item) => item.id}
        renderItem={({ item: event }) => {
          const mediaUrl = event.tagValue("url");
          const mimeType = event.tagValue("m") ?? "video/mp4";

          if (!mediaUrl) return null;

          if (mimeType.startsWith("video/")) {
            return (
              <Video
                ref={(ref) => (videoRefs.current[event.id] = ref)}
                source={{ uri: mediaUrl }}
                style={styles.media}
                resizeMode="cover"
                isLooping
                shouldPlay={false}
                isMuted={true} // Add this line to mute the video
                onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
                  if (status.isLoaded && !status.isPlaying) {
                    videoRefs.current[event.id]?.playAsync();
                  }
                }}
              />
            );
          } else {
            return (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.media}
                resizeMode="cover"
              />
            );
          }
        }}
        pagingEnabled
        horizontal // Change this from vertical to horizontal
        showsHorizontalScrollIndicator={false} // Change this from vertical to horizontal
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        style={styles.flashList} // Add this line
        contentContainerStyle={styles.flashListContent} // Add this line
      />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: "white",
        alignItems: "center",
        justifyContent: "space-around",
    },
    media: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        aspectRatio: Dimensions.get("window").width / Dimensions.get("window").height,
    },
    // ... other existing styles ...
});
