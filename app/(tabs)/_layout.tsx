import "expo-dev-client";

import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { View } from "react-native"; // Import View from react-native

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { usePathname } from "expo-router";
import Relays from "@/components/header/Relays";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>["name"];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const pathname = usePathname();

    const isUploadScreen = pathname === "/upload";

    return (
        <Tabs
            screenOptions={{
                headerRight: () => <Relays />,
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: useClientOnlyValue(false, true),
                tabBarStyle: {
                    position: "absolute",
                    elevation: 0,
                    display: isUploadScreen ? "none" : "flex",
                    backgroundColor: colorScheme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                },
                tabBarBackground: () => (
                    <View
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: colorScheme === "dark" ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                        }}
                    />
                ),
                headerTintColor: Colors[colorScheme ?? "light"].tint,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <TabBarIcon name="instagram" color={color} />,
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={({ route }) => ({
                    title: route.params?.walletName || "Wallet",
                    tabBarIcon: ({ color }) => <TabBarIcon name="bolt" color={color} />,
                })}
            />
            <Tabs.Screen
                name="user"
                options={({ route }) => ({
                    title: "Settings",
                    tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
                })}
            />
        </Tabs>
    );
}
