const db = require("../config/firebase");

const getForumPosts = async () => {
  const forumRef = await db.collection("forums").get();

  if (forumRef.empty) {
    return [];
  }

  const posts = forumRef.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return posts;
};

const postForum = async ({ title, content, courseTag, author }) => {
  try {
    const docRef = await db.collection("forums").add({
      title,
      content,
      courseTag,
      author,
      createdAt: new Date(),
    });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error("Error posting forum: ", error);
    throw new Error("Failed to post forum");
  }
};

module.exports = { getForumPosts, postForum };
