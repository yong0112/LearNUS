const { db } = require("../config/firebase");

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
      upvoteCount: 0,
    });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error("Error posting forum: ", error);
    throw new Error("Failed to post forum");
  }
};

const getComments = async (postId) => {
  try {
    const commentsRef = await db
      .collection("forums")
      .doc(postId)
      .collection("comments")
      .get();
    if (commentsRef.empty) {
      return [];
    }
    const comments = commentsRef.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return comments;
  } catch (error) {
    console.error("Error fetching comments: ", error);
    throw new Error("Failed to fetch comments");
  }
};

const postComment = async (postId, { content, author, authorName }) => {
  try {
    const postRef = db.collection("forums").doc(postId);
    const postDoc = await postRef.get();
    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    const docRef = await postRef.collection("comments").add({
      content,
      author,
      authorName,
      createdAt: new Date(),
      upvoteCount: 0,
    });
    const savedDoc = await docRef.get();
    return { id: docRef.id, ...savedDoc.data() };
  } catch (error) {
    console.error("Error fetching comments: ", error);
    throw new Error("Failed to fetch comments");
  }
};

const togglePostUpvote = async (postId, userId) => {
  try {
    const postRef = db.collection("forums").doc(postId);
    const upvoteRef = postRef.collection("upvotes").doc(userId);

    return await db.runTransaction(async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists) {
        throw new Error("Post not found");
      }

      const upVoteDoc = await transaction.get(upvoteRef);
      const currentCount = postDoc.data().upvoteCount || 0;

      if (upVoteDoc.exists) {
        // User has already upvoted, remove the upvote
        transaction.delete(upvoteRef);
        transaction.update(postRef, { upvoteCount: currentCount - 1 });
        return { upvoteCount: currentCount - 1, hasUpvoted: false };
      } else {
        // User has not upvoted, add the upvote
        transaction.set(upvoteRef, { userId });
        transaction.update(postRef, { upvoteCount: currentCount + 1 });
        return { upvoteCount: currentCount + 1, hasUpvoted: true };
      }
    });
  } catch (error) {
    console.error("Error toggling post upvote: ", error);
    throw new Error("Failed to toggle post upvote");
  }
};

const getPostUpvoteStatus = async (postId, userId) => {
  try {
    const postRef = db.collection("forums").doc(postId);
    const upvoteRef = postRef.collection("upvotes").doc(userId);
    const [postDoc, upvoteDoc] = await Promise.all([
      postRef.get(),
      upvoteRef.get(),
    ]);

    if (!postDoc.exists) {
      throw new Error("Post not found");
    }

    return {
      upvoteCount: postDoc.data().upvoteCount || 0,
      hasUpvoted: upvoteDoc.exists,
    };
  } catch (error) {
    console.error("Error fetching post upvote status: ", error);
    throw new Error("Failed to fetch post upvote status");
  }
};

const toggleCommentUpvote = async (postId, commentId, userId) => {
  try {
    const commentRef = db
      .collection("forums")
      .doc(postId)
      .collection("comments")
      .doc(commentId);
    const upvoteRef = commentRef.collection("upvotes").doc(userId);

    return await db.runTransaction(async (transaction) => {
      const commentDoc = await transaction.get(commentRef);
      if (!commentDoc.exists) {
        throw new Error("Comment not found");
      }

      const upVoteDoc = await transaction.get(upvoteRef);
      const currentCount = commentDoc.data().upvoteCount || 0;

      if (upVoteDoc.exists) {
        // User has already upvoted, remove the upvote
        transaction.delete(upvoteRef);
        transaction.update(commentRef, { upvoteCount: currentCount - 1 });
        return { upvoteCount: currentCount - 1, hasUpvoted: false };
      } else {
        // User has not upvoted, add the upvote
        transaction.set(upvoteRef, { userId });
        transaction.update(commentRef, { upvoteCount: currentCount + 1 });
        return { upvoteCount: currentCount + 1, hasUpvoted: true };
      }
    });
  } catch (error) {
    console.error("Error toggling comment upvote: ", error);
    throw new Error("Failed to toggle comment upvote");
  }
};

const getCommentUpvoteStatus = async (postId, commentId, userId) => {
  try {
    const commentRef = db
      .collection("forums")
      .doc(postId)
      .collection("comments")
      .doc(commentId);
    const upvoteRef = commentRef.collection("upvotes").doc(userId);
    const [commentDoc, upvoteDoc] = await Promise.all([
      commentRef.get(),
      upvoteRef.get(),
    ]);

    if (!commentDoc.exists) {
      throw new Error("Comment not found");
    }

    return {
      upvoteCount: commentDoc.data().upvoteCount || 0,
      hasUpvoted: upvoteDoc.exists,
    };
  } catch (error) {
    console.error("Error fetching comment upvote status: ", error);
    throw new Error("Failed to fetch comment upvote status");
  }
};

module.exports = {
  getForumPosts,
  postForum,
  getComments,
  postComment,
  togglePostUpvote,
  getPostUpvoteStatus,
  toggleCommentUpvote,
  getCommentUpvoteStatus,
};
