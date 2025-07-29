import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig.extra.eas.projectId,
  });
  return tokenData.data;
}

// Handle notification taps
export function setupNotificationHandlers(router) {
  // Handle notification tap when app is in background/closed
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { status, sessionId } = response.notification.request.content.data;
    
    if (sessionId) {
      // Navigate to session details page
      router.push({
        pathName: "/booking/bookingStatus",
        params: { id: sessionId }
      });
    }
  });

  // Handle notification received when app is in foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    // You can show custom UI or just let the default notification show
    console.log('Notification received in foreground:', notification);
  });

  return () => {
    subscription.remove();
    foregroundSubscription.remove();
  };
}

// Helper function to navigate based on session status
export function getNavigationRoute(status, sessionId) {
  switch (status) {
    case 'Pending':
      return { pathName: "/booking/bookingAcceptance", params: { id: sessionId } }; // Tutor view - show pending requests
    case 'Accepted':
      return { pathName: "/booking/paymentPrompt", params: { id: sessionId } }; // Student view - payment screen
    case 'Rejected':
      return { pathName: "/booking/bookingStatus", params: { id: sessionId } }; // Student view - back to session list
    case 'Paid':
      return { pathName: "/booking/confirmation", params: { id: sessionId } }; // Tutor view - review payment
    case 'Confirmed':
      return { pathName: "/booking/bookingStatus", params: { id: sessionId } }; // Student view - session details
    case 'Completed':
      return { pathName: "/booking/review", params: { id: sessionId } }; // Student view - review form
    case 'Reviewed':
      return "/profile/ratings"; // Tutor view - see feedback
    default:
      return { pathName: "/booking/bookingStatus", params: { id: sessionId } };
  }
}