import { useNDK } from "@/ndk-expo";
import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { router } from 'expo-router';
import { nip19 } from 'nostr-tools';
import React, { useEffect, useState } from 'react';
import { View, Text } from "@/components/Themed";
import { TouchableOpacity, StyleSheet } from 'react-native';

const UserSettings = () => {
    const { ndk, logout } = useNDK();
    const [nsec, setNsec] = useState<string | null>(null);

    useEffect(() => {
        if (ndk) {
            if (ndk.signer instanceof NDKPrivateKeySigner) {
                const value = nip19.nsecEncode(ndk.signer._privateKey!);
                setNsec(value);
            }
        }
    }, [ndk]);
    
    const handleLogout = () => {
        if (logout) logout();
        router.push("/");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            {(nsec && (
                
                <Text>
                    {nsec}
                </Text>

            ))}
            
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default UserSettings;
