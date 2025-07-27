import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { auth } from "./firebase";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    // Send token to backend
    const currentUser = auth.currentUser;
    if (currentUser) {
      await fetch(
        `https://learnus.onrender.com/api/users/${currentUser.uid}/push-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: currentUser.uid,
            pushToken: token,
          }),
        },
      );
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  // Configure notification handling
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  return token;
}
