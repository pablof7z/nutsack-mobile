import { useState, useRef } from 'react';
import { View, Text } from '@/components/Themed';
import { StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNDKWallet } from '@/_providers/ndk-wallet/context';
import { NDKCashuWallet } from '@nostr-dev-kit/ndk-wallet';
import { Picker } from '@react-native-picker/picker'; // Add this import
import QRCode from 'react-native-qrcode-svg'; // Add this import
import { router } from 'expo-router';

function ReceiveView() {
    const [amount, setAmount] = useState(1000);
    const [selectedMint, setSelectedMint] = useState<string | null>(null); // Track selected mint
    const inputRef = useRef<TextInput | null>(null);
    const { defaultWallet } = useNDKWallet();
    const [qrCode, setQrCode] = useState<string | null>(null);

    if (!(defaultWallet as NDKCashuWallet)) return (
        <View>
            <Text>
                No wallet found
            </Text>
        </View>
    )

    const handleContinue = async () => {
        if (!selectedMint) {
            console.error('No mint selected');
            return;
        }
        const deposit = (defaultWallet as NDKCashuWallet).deposit(amount, selectedMint);
        console.log('deposit', deposit);

        deposit.on("success", (token) => {
            console.log('success', token);
            router.navigate('/(tabs)/wallet');
        });
        
        const qr = await deposit.start();
        console.log('qr', qr);
        setQrCode(qr);
    };

    return (
        <View style={{ flex: 1 }}>
            <TextInput 
                ref={inputRef}
                keyboardType="numeric" 
                autoFocus
                style={styles.input} 
                value={amount.toString()}
                onChangeText={(text) => setAmount(Number(text))}
            />

            <Text 
                style={styles.amount} 
                onPress={() => inputRef.current?.focus()}
            >
                {amount}
            </Text>
            <Text
                style={styles.unit}
            >
                {(defaultWallet as NDKCashuWallet).unit}
            </Text>

            {qrCode ? ( // Conditionally render QR code
                <View>
                    <Text>Your QR Code:</Text>
                    <View style={styles.qrCodeContainer}>
                        <QRCode value={qrCode} size={350} />
                    </View>
                </View>
            ) : (
                <>
                    <TouchableOpacity 
                        onPress={handleContinue} 
                        style={styles.continueButton}
                    >
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>

                    <Picker
                        selectedValue={selectedMint}
                        onValueChange={(itemValue) => setSelectedMint(itemValue)}
                        style={styles.picker}
                    >
                        {defaultWallet.mints.map((mint, index) => (
                            <Picker.Item key={index} label={mint} value={mint} />
                        ))}
                    </Picker>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        fontSize: 10,
        width: 0,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    amount: {
        fontSize: 72,
        marginTop: 10,
        width: '100%',
        textAlign: 'center',
        fontWeight: '900',
        backgroundColor: 'transparent',
    },
    mint: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 8,
        fontWeight: 'bold',
    },
    selectedMint: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 8,
        fontWeight: 'bold',
    },
    mintContainer: {
        // Add styles for the container if needed
    },
    selectedMintText: {
        // Add styles for the selected text if needed
    },
    unit: {
        fontSize: 24, // Adjusted font size for smaller display
        width: '100%',
        textAlign: 'center',
        fontWeight: '400', // Optional: adjust weight if needed
        backgroundColor: 'transparent',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    continueButton: {
        backgroundColor: '#007BFF', // Button background color
        padding: 20, // Padding for the button
        borderRadius: 5, // Rounded corners
        alignItems: 'center', // Center the text
        marginTop: 20, // Space above the button
        width: '60%', // Set a narrower width for the button
        alignSelf: 'center', // Center the button horizontally
    },
    continueButtonText: {
        color: '#FFFFFF', // Text color
        fontSize: 16, // Font size
        fontWeight: 'bold', // Bold text
    },
    qrCodeContainer: {
        alignItems: 'center', // Center-aligns the QR code
        justifyContent: 'center', // Center vertically
    },
});

export default ReceiveView;