const { db, admin } = require("../config/firebase");

const getUserSession = async (uid, cid) => {
  const sessionDoc = await db
    .collection("users")
    .doc(uid)
    .collection("classes")
    .doc(cid)
    .get();

  if (!sessionDoc.exists) {
    throw new Error("404 Session not found");
  }

  return { id: sessionDoc.id, ...sessionDoc.data() };
};

const updateUserSessionField = async (uid, cid, updateData) => {
  const classRef = db
    .collection("users")
    .doc(uid)
    .collection("classes")
    .doc(cid);
  await classRef.update(updateData);
};

const updateExpiredSessionsManual = async () => {
  try {
    const now = new Date();
    console.log("Current time:", now.toISOString());

    const usersRef = await db.collection("users").get();
    const userIds = usersRef.docs.map((doc) => doc.id);

    if (userIds.length === 0) {
      return { updated: 0, message: "No user IDs provided for manual check" };
    }

    let expiredSessions = [];

    // Check each user's classes
    for (const userId of userIds) {
      try {
        console.log(`Checking user: ${userId}`);

        const classesRef = db
          .collection("users")
          .doc(userId)
          .collection("classes");
        const snapshot = await classesRef.get();

        console.log(`User ${userId} has ${snapshot.size} classes`);

        snapshot.docs.forEach((doc) => {
          const data = doc.data();

          if (
            data.status &&
            data.status !== "Completed" &&
            data.status !== "Reviewed" &&
            data.endedAt
          ) {
            const endedAtDate = new Date(data.endedAt);
            console.log("Checking session:", {
              userId: userId,
              classId: doc.id,
              status: data.status,
              endedAt: data.endedAt,
              isExpired: endedAtDate <= now,
            });

            if (endedAtDate <= now) {
              expiredSessions.push({ userId, classId: doc.id, doc });
            }
          }
        });
      } catch (userError) {
        console.error(`Error checking user ${userId}:`, userError.message);
      }
    }

    console.log("Total expired sessions found:", expiredSessions.length);

    if (expiredSessions.length === 0) {
      return { updated: 0, message: "No expired sessions found" };
    }

    // Update expired sessions
    const batch = db.batch();
    expiredSessions.forEach(({ userId, classId }) => {
      const sessionRef = db
        .collection("users")
        .doc(userId)
        .collection("classes")
        .doc(classId);
      batch.update(sessionRef, { status: "Completed" });
    });

    await batch.commit();
    console.log("Batch update completed");

    return {
      updated: expiredSessions.length,
      message: `Successfully updated ${expiredSessions.length} expired sessions`,
      details: expiredSessions.map((s) => ({
        userId: s.userId,
        classId: s.classId,
      })),
    };
  } catch (error) {
    console.error("Error in manual update:", error);
    throw new Error(`Failed to update expired sessions: ${error.message}`);
  }
};

// This will be our working function for now
const updateExpiredSessions = updateExpiredSessionsManual;

const getUserSessionWithExpirationCheck = async (uid, cid) => {
  try {
    const session = await getUserSession(uid, cid);

    if (session && session.endedAt) {
      const now = new Date();
      const endedAtDate = new Date(session.endedAt);

      console.log("Lazy check:", {
        now: now.toISOString(),
        endedAt: session.endedAt,
        endedAtParsed: endedAtDate.toISOString(),
        isExpired: endedAtDate <= now,
        currentStatus: session.status,
      });

      if (
        endedAtDate <= now &&
        session.status !== "Completed" &&
        session.status !== "Reviewed"
      ) {
        console.log("Updating session to Completed");
        await updateUserSessionField(uid, cid, { status: "Completed" });
        session.status = "Completed";
      }
    }

    return session;
  } catch (error) {
    console.error("Error getting session with expiration check:", error);
    throw error;
  }
};

module.exports = {
  getUserSession,
  updateUserSessionField,
  updateExpiredSessions,
  getUserSessionWithExpirationCheck,
  updateExpiredSessionsManual,
};
