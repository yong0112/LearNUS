const cron = require("node-cron");
const admin = require("firebase-admin");
const db = admin.firestore();

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const snapshot = await db
      .collectionGroup("classes")
      .where("endedAt", "<=", now)
      .get();

    const updatePromises = [];

    snapshot.forEach((doc) => {
      const session = doc.data();

      if (session.status != "Completed") {
        const updatePromise = doc.ref.update({ status: "Completed" });
        updatePromises.push(updatePromise);
        console.log(`Session ${doc.id} is marked as completed`);
      }
    });
  } catch (err) {
    console.error("Error updating session statuses:", err);
  }
});
