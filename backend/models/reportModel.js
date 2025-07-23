const { db } = require("../config/firebase");

const postReport = async ({ title, content, reporter }) => {
  try {
    const docRef = await db.collection("reports").add({
      title,
      content,
      author,
      createdAt: new Date(),
    });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error("Error posting report: ", error);
    throw new Error("Failed to post report");
  }
};

module.exports = { postReport };
