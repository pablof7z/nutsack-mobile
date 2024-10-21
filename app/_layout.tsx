import "@bacons/text-decoder/install";

import "react-native-get-random-values";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

global.crypto = crypto;

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { GroupsProvider } from "@/_providers/groups/context";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { NDKProvider } from "@/ndk-expo/providers/ndk";
import { NDKWalletProvider } from "@/_providers/ndk-wallet/context";

import { useColorScheme } from "@/components/useColorScheme";
import { NDKCacheAdapterSqlite } from "@/ndk-expo";
import NDKSessionProvider from "@/ndk-expo/providers/session";
import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from "expo-router";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
        </GestureHandlerRootView>
    );
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();


    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <NDKProvider
                explicitRelayUrls={['ws://localhost:2929', 'wss://relay.primal.net', 'wss:/purplepag.es']}
                cacheAdapter={new NDKCacheAdapterSqlite('nutsack')}
            >
                <NDKSessionProvider
                    follows={true}
                    kinds={new Map([
                        [ NDKKind.SimpleGroupList, { wrapper: NDKList } ]
                    ])}
                >
                    <NDKWalletProvider>
                        <GroupsProvider>
                            
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="(tabs)" />
                                <Stack.Screen
                                    name="login"
                                    options={{ presentation: "modal" }}
                                />
                                <Stack.Screen
                                    name="wallet/new"
                                    options={{ headerTitle: "New Wallet", presentation: "modal" }}
                                />
                                <Stack.Screen
                                    name="wallet/send"
                                    options={{ presentation: "modal" }}
                                />
                                <Stack.Screen
                                    name="wallet/receive"
                                    options={{ presentation: "modal", headerShown: true, headerTitle: "Receive" }}
                                />
                                <Stack.Screen
                                    name="modal"
                                    options={{ presentation: "modal" }}
                                />
                                <Stack.Screen name="setting/relays" options={{ headerShown: true, headerTitle: "Relays", presentation: "modal" }} />
                                <Stack.Screen name="group/[id]" />
                                <Stack.Screen name="user/[id]/chat-view" options={{ headerShown: true, headerTitle: "Notes" }} />
                            </Stack>
                        </GroupsProvider>
                    </NDKWalletProvider>
                </NDKSessionProvider>
            </NDKProvider>
        </ThemeProvider>
    );
}
