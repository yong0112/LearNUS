import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import { ThemeProvider } from "@/components/ThemedContext";
import * as Notifications from "expo-notifications";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MenuProvider } from "react-native-popup-menu";
import { registerForPushNotificationsAsync } from "@/lib/notification";
import "../lib/firebase.ts";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const router = useRouter();

  useEffect(() => {
    // Handle notifications received while app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    // Handle notification tapped (foreground or background)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const { cid } = response.notification.request.content.data;
        if (cid) {
          router.push(`/booking/bookingStatus?id=${cid}`);
        }
      });

    // Clean up listeners on unmount
    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <MenuProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </ThemeProvider>
    </MenuProvider>
  );
}
