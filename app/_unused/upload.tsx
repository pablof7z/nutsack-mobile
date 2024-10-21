import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PostPhoto from "@/components/event/PostPhoto";
import { NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
import { useNDK } from "@/ndk-expo";
import { Uploader } from "@/utils/uploader";
import * as FileSystem from "expo-file-system";

export default function UploadScreen() {
    const [facing, setFacing] = useState<CameraType>("back");
    const [permission, requestPermission] = useCameraPermissions();
    const router = useRouter();
    const cameraRef = useRef<CameraView | null>(null);
    const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
    const { ndk } = useNDK();

    useEffect(() => {
        return () => {
            // Cleanup function to ensure camera is stopped when component unmounts
            if (cameraRef.current) {
                cameraRef.current.pausePreview();
            }
        };
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }

    async function takePhoto() {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            setPhoto(photo);
        }
    }

    async function handlePost(caption: string) {
        if (!photo) {
            console.error("No photo to upload");
            return;
        }

        try {
            // Read the file content using expo-file-system
            const fileContent = await FileSystem.readAsStringAsync(photo.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert base64 to Blob
            const blob = await fetch(`data:image/jpeg;base64,${fileContent}`).then((res) =>
                res.blob()
            );

            // Create an Uploader instance with the blob
            const uploader = new Uploader(ndk, blob, "https://blossom.primal.net");

            // Set up progress and error handlers if needed
            uploader.onProgress = (progress) => {
                console.log(`Upload progress: ${progress}%`);
            };

            uploader.onError = (error) => {
                console.error("Upload error:", error);
            };

            uploader.onUploaded = async (url) => {
                console.log("👉 url", url, !!ndk);
                // Get the media event
                const mediaEvent = await uploader.mediaEvent();
                console.log("mediaEvent", mediaEvent.rawEvent());

                // Create a new NDKEvent for the post
                const event = new NDKEvent(ndk);
                event.kind = NDKKind.Media;
                event.content = caption;
                event.tags = mediaEvent.tags;

                console.log("event", event.rawEvent());
                console.log("mediaEvent", mediaEvent.rawEvent());

                // Publish the event
                await event.publish();
                console.log("event", event.rawEvent());

                console.log("Photo uploaded and post published");
                setPhoto(null);
            };

            // Start the upload
            await uploader.start();
        } catch (error) {
            console.error("Error uploading photo:", error);
        }
    }

    if (photo) {
        return <PostPhoto photoUri={photo.uri} onPost={handlePost} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.push("/home")}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="flash-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomBar}>
                    <TouchableOpacity>
                        <Ionicons name="images-outline" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleCameraFacing}>
                        <Ionicons name="camera-reverse-outline" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    camera: {
        flex: 1,
    },
    topBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
    },
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    captureButtonInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "white",
    },
    message: {
        color: "white",
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#0095f6",
        padding: 15,
        borderRadius: 5,
        alignSelf: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
