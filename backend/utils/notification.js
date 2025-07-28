const { Expo } = require("expo-server-sdk");
const { db } = require("../config/firebase");

const expo = new Expo();

const sendBookingNotification = async (session, status, uid, cid) => {
  try {
    // Determine student and tutor UIDs
    const studentUid = session.role === "Student" ? uid : session.people;
    const tutorUid = session.role === "Tutor" ? uid : session.people;

    // Fetch user data for push tokens
    const studentDoc = await db.collection("users").doc(studentUid).get();
    const tutorDoc = await db.collection("users").doc(tutorUid).get();
    const studentToken = studentDoc.data()?.pushToken;
    const tutorToken = tutorDoc.data()?.pushToken;

    const messages = [];

    // Define notification messages based on status
    switch (status) {
      case "Pending":
        recipientToken = tutorToken;
        recipientType = "tutor";
        if (tutorToken && Expo.isExpoPushToken(tutorToken)) {
          messages.push({
            to: tutorToken,
            sound: "default",
            title: "New Booking Request",
            body: `A student has booked your session for ${session.course} on ${session.dayOfWeek}. Please accept or reject.`,
            data: { cid, uid: tutorUid },
          });
        }
        break;
      case "Accepted":
        if (studentToken && Expo.isExpoPushToken(studentToken)) {
          messages.push({
            to: studentToken,
            sound: "default",
            title: "Booking Accepted",
            body: `Your booking for ${session.course} has been accepted by the tutor. Please proceed with payment.`,
            data: { cid, uid: studentUid },
          });
        }
        break;
      case "Rejected":
        if (studentToken && Expo.isExpoPushToken(studentToken)) {
          messages.push({
            to: studentToken,
            sound: "default",
            title: "Booking Rejected",
            body: `Your booking for ${session.course} has been rejected by the tutor.`,
            data: { cid, uid: studentUid },
          });
        }
        break;
      case "Paid":
        if (tutorToken && Expo.isExpoPushToken(tutorToken)) {
          messages.push({
            to: tutorToken,
            sound: "default",
            title: "Payment Submitted",
            body: `The student has submitted payment proof for ${session.course}. Please confirm receipt.`,
            data: { cid, uid: tutorUid },
          });
        }
        break;
      case "Confirmed":
        if (studentToken && Expo.isExpoPushToken(studentToken)) {
          messages.push({
            to: studentToken,
            sound: "default",
            title: "Payment Confirmed",
            body: `Your payment for ${session.course} has been confirmed by the tutor.`,
            data: { cid, uid: studentUid },
          });
        }
        break;
      case "Completed":
        if (studentToken && Expo.isExpoPushToken(studentToken)) {
          messages.push({
            to: studentToken,
            sound: "default",
            title: "Session Completed",
            body: `Your session for ${session.course} has been completed. Please leave a review.`,
            data: { cid, uid: studentUid },
          });
        }
        break;
      case "Reviewed":
        if (tutorToken && Expo.isExpoPushToken(tutorToken)) {
          messages.push({
            to: tutorToken,
            sound: "default",
            title: "New Review Received",
            body: `You have received a review for your ${session.course} session.`,
            data: { cid, uid: tutorUid },
          });
        }
        break;
    }

    console.log("Recipient type:", recipientType);
    console.log("Recipient token:", recipientToken ? "EXISTS" : "MISSING");
    console.log("Messages to send:", messages.length);

    // Send notifications
    if (messages.length > 0) {
      const chunks = expo.chunkPushNotifications(messages);
      console.log("Number of chunks:", chunks.length);
      for (const chunk of chunks) {
        try {
          await expo.sendPushNotificationsAsync(chunk);
          console.log("Notifications sent:", chunk);
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error in sendBookingNotification:", error);
  }
};

module.exports = { sendBookingNotification };
