const { Expo } = require("expo-server-sdk");
const expo = new Expo();

exports.sendPushNotification = async (pushToken, message) => {
  const notifications = [
    {
      to: pushToken,
      sound: "default",
      title: message.title || "📢 Notification",
      body: message.body || "",
      data: message.data || {},
    },
  ];

  const chunks = expo.chunkPushNotifications(notifications);

  for (let chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Expo push error:", error);
    }
  }
};
