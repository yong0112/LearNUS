const {
  getUserSession,
  updateUserSessionField,
  updateExpiredSessions,
  getUserSessionWithExpirationCheck,
} = require("../models/sessionModel");
const { getUserClasses } = require("../models/classesModel");
const {
  sendBookingNotification,
  convertTitle,
} = require("../utils/notification");
const { sendNoti } = require("../models/notificationModel");
const { getUserProfile } = require("../models/userModel");
const { formatAvailability } = require("../utils/timeConverter");

const fetchUserSession = async (req, res) => {
  const uid = req.params.uid;
  const cid = req.params.cid;

  if (!uid || !cid) {
    return res
      .status(400)
      .json({ error: "Missing uid or cid in the request parameters." });
  }

  try {
    const session = await getUserSession(uid, cid);
    res.json(session);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

const updateSessionStatus = async (req, res) => {
  const { uid, cid, status } = req.body;

  if (!uid || !cid || !status) {
    return res
      .status(400)
      .json({ error: "Missing uid or cid in the request parameters." });
  }

  try {
    const updatedData = {
      ...(status && { status }),
    };
    const session = await getUserSession(uid, cid);
    const otherId = session.people;
    const profileId = session.profile;
    const classes = await getUserClasses(otherId);
    const otherSessionId = classes.find((cls) => cls.profile == profileId).id;
    await updateUserSessionField(uid, cid, updatedData);
    await updateUserSessionField(otherId, otherSessionId, updatedData);

    const profile = await getUserProfile(uid);
    const name = profile.firstName + " " + profile.lastName;
    const course = session.course;
    const slot = formatAvailability(
      session.dayOfWeek,
      session.startTime,
      session.endTime,
    );
    const noti = convertTitle(status, name, course, slot);

    const notificationResult = await sendNoti(
      otherId,
      noti.title,
      noti.message,
      uid,
      otherSessionId,
    );
    console.log("Notification created:", notificationResult);

    res.json({ message: "Session updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePaymentProof = async (req, res) => {
  const { uid, cid, paymentProof } = req.body;

  if (!uid || !cid || !paymentProof) {
    return res
      .status(400)
      .json({ error: "Missing uid or cid in the request parameters." });
  }

  try {
    const updatedData = {
      ...(paymentProof && { paymentProof: paymentProof }),
      ...{ status: "Paid" },
    };
    const session = await getUserSession(uid, cid);
    const otherId = session.people;
    const profileId = session.profile;
    const classes = await getUserClasses(otherId);
    const otherSessionId = classes.find((cls) => cls.profile == profileId).id;
    await updateUserSessionField(uid, cid, updatedData);
    await updateUserSessionField(otherId, otherSessionId, updatedData);

    const profile = await getUserProfile(uid);
    const name = profile.firstName + " " + profile.lastName;
    const course = session.course;
    const slot = formatAvailability(
      session.dayOfWeek,
      session.startTime,
      session.endTime,
    );
    const noti = convertTitle("Paid", name, course, slot);

    const notificationResult = await sendNoti(
      otherId,
      noti.title,
      noti.message,
      uid,
      otherSessionId,
    );
    console.log("Notification created:", notificationResult);

    res.json({ message: "Payment proof posted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cleanupExpiredSessions = async (req, res) => {
  try {
    const result = await updateExpiredSessions();

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Cleanup controller error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Enhanced version of your fetchUserSession with expiration check
const fetchUserSessionWithExpiration = async (req, res) => {
  const uid = req.params.uid;
  const cid = req.params.cid;

  if (!uid || !cid) {
    return res
      .status(400)
      .json({ error: "Missing uid or cid in the request parameters." });
  }

  try {
    const session = await getUserSessionWithExpirationCheck(uid, cid);
    res.json(session);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

module.exports = {
  fetchUserSession,
  updateSessionStatus,
  updatePaymentProof,
  cleanupExpiredSessions,
  fetchUserSessionWithExpiration,
};
