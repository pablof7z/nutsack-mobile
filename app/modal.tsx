import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
} from "react-native";
import { Text, View } from "@/components/Themed";

export default function ModalScreen({ navigation }: { navigation: any }) {
    const [caption, setCaption] = useState("");

    const handleSubmit = () => {
        // TODO: Handle the caption submission (e.g., save it or pass it back to the parent component)
        console.log("Caption submitted:", caption);
        navigation.goBack(); // Close the modal
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add Photo Caption</Text>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Enter caption for your photo"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                />
            </View>
            <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    input: {
        flex: 1,
        padding: 10,
        marginBottom: 20,
        textAlignVertical: "top",
    },
    button: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
});
