import React from 'react';
import { View } from "@/components/Themed";
import { Text, Image, StyleSheet, Button } from 'react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

const WelcomePage: React.FC = () => {
    return (
        <View style={styles.container}>
            <Image source={require('../assets/images/icon.png')} alt="Nutsack Logo" style={styles.image} />
            <Text style={styles.text}>
                Nutsack
            </Text>

            {/* Login button */}
            <TouchableOpacity
                onPress={() => {
                    router.push('/login');
                }}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 128,
        height: 128,
    },
    text: {
        fontWeight: '800',
        fontSize: 64,
    },
    button: {
        borderRadius: 999, // Rounded corners
        padding: 20, // Padding inside the button
        marginTop: 20, // Space above the button
        minWidth: 200,
        width: '100%',
        backgroundColor: '#841584',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    buttonText: {
        color: 'white', // Text color
        fontSize: 16, // Text size
        fontWeight: 'bold', // Text weight
    },
});

export default WelcomePage;
