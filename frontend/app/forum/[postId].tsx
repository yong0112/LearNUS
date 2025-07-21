import { auth, db } from "@/lib/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import {
  ForumPost,
  Comment,
  UserProfile,
  UpvoteStatus,
} from "../../constants/types";

export default function ForumPostDetails() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userProfiles, setUserProfiles] = useState<
    Record<string, UserProfile | undefined>
  >({});
  const [postUpvoteStatus, setPostUpvoteStatus] = useState<UpvoteStatus | null>(
    null,
  );
  const [commentUpvoteStatuses, setCommentUpvoteStatus] = useState<
    Record<string, UpvoteStatus>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [postMenuVisible, setPostMenuVisible] = useState(false);
  const [commentMenuVisibleId, setCommentMenuVisibleId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const BASE_URL = "https://learnus.onrender.com";

  // Fetch post, comments, profiles, and upvote statuses
  useEffect(() => {
    if (!postId || typeof postId !== "string") return;

    const fetchData = async () => {
      try {
        // Fetch post
        const postRes = await fetch(`${BASE_URL}/api/forum`);
        if (!postRes.ok) throw new Error("Failed to fetch post");
        const posts: ForumPost[] = await postRes.json();
        const foundPost = posts.find((p) => p.id === postId);
        if (!foundPost) throw new Error("Post not found");
        setPost(foundPost);

        // Fetch comments
        const commentsRes = await fetch(
          `${BASE_URL}/api/forum/${postId}/comments`,
        );
        if (!commentsRes.ok) throw new Error("Failed to fetch comments");
        const commentsData: Comment[] = await commentsRes.json();
        // Sort by upvoteCount (highest first)
        setComments(commentsData.sort((a, b) => b.upvoteCount - a.upvoteCount));

        // Fetch profiles
        const profiles: Record<string, UserProfile | undefined> = {};
        const authorIds = new Set([
          foundPost.author,
          ...commentsData.map((c) => c.author),
        ]);
        await Promise.all(
          Array.from(authorIds).map(async (authorId) => {
            try {
              const userRes = await fetch(`${BASE_URL}/api/users/${authorId}`);
              if (!userRes.ok) return;
              const userData: UserProfile = await userRes.json();
              profiles[authorId] = userData;
            } catch (err) {
              console.error(err);
            }
          }),
        );
        setUserProfiles(profiles);

        // Fetch upvote statuses
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          const postUpvoteRes = await fetch(
            `${BASE_URL}/api/forum/${postId}/upvote-status/${userId}`,
          );
          if (postUpvoteRes.ok) {
            setPostUpvoteStatus(await postUpvoteRes.json());
          }

          const commentStatuses: Record<string, UpvoteStatus> = {};
          await Promise.all(
            commentsData.map(async (comment) => {
              const commentUpvoteRes = await fetch(
                `${BASE_URL}/api/forum/${postId}/comments/${comment.id}/upvote-status/${userId}`,
              );
              if (commentUpvoteRes.ok) {
                commentStatuses[comment.id] = await commentUpvoteRes.json();
              }
            }),
          );
          setCommentUpvoteStatus(commentStatuses);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    fetchData();
  }, [postId]);

  // Handle upvote for post
  const handlePostUpvote = async () => {
    if (!auth.currentUser) {
      Alert.alert("Please log in to upvote");
      return;
    }
    if (!postId || typeof postId !== "string") return;

    try {
      const res = await fetch(`${BASE_URL}/api/forum/${postId}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid }),
      });
      if (!res.ok) throw new Error("Failed to toggle upvote");
      const result: UpvoteStatus = await res.json();
      setPostUpvoteStatus(result);
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to upvote");
    }
  };

  // Handle upvote for comment
  const handleCommentUpvote = async (commentId: string) => {
    if (!auth.currentUser) {
      Alert.alert("Please log in to upvote");
      return;
    }
    if (!postId || typeof postId !== "string") return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/forum/${postId}/comments/${commentId}/upvote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: auth.currentUser.uid }),
        },
      );
      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(
          `Failed to toggle upvote: ${res.status} ${res.statusText} - ${errorBody}`,
        );
      }
      const result: UpvoteStatus = await res.json();
      setCommentUpvoteStatus((prev) => ({ ...prev, [commentId]: result }));
      // Re-sort comments
      setComments((prev) =>
        [...prev].sort(
          (a, b) =>
            b.upvoteCount +
            (result.upvoteCount - a.upvoteCount) -
            a.upvoteCount,
        ),
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to upvote");
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!auth.currentUser) {
      Alert.alert("Please log in to delete the post");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/forum/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error("Failed to delete post: " + errorData);
      }
      setPostMenuVisible(false);
      Alert.alert("Post deleted successfully");
      router.push("/(tabs)/forum");
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to delete post");
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!auth.currentUser) {
      Alert.alert("Please log in to delete a comment");
      return;
    }
    if (!postId || typeof postId !== "string") return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/forum/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: auth.currentUser.uid }),
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete comment");
      }
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setCommentMenuVisibleId(null);
      Alert.alert("Comment deleted successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to delete comment");
    }
  };

  // Format timestamp
  const formatTimestamp = (createdAt: {
    _seconds: number;
    _nanoseconds: number;
  }) => {
    return new Date(
      createdAt._seconds * 1000 + createdAt._nanoseconds / 1000000,
    ).toLocaleString();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 10,
    },
    background: {
      position: "absolute",
      top: -550,
      left: -150,
      width: 700,
      height: 650,
      backgroundColor: "#ffc04d",
      zIndex: -1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      color: text,
    },
    postCard: {
      marginTop: 20,
      marginBottom: 20,
      flexDirection: "column",
      borderBottomWidth: 2,
      borderBottomColor: "gray",
      paddingBottom: 10,
    },
    commentCard: {
      marginBottom: 16,
      padding: 10,
      backgroundColor: isDarkMode ? "#999999" : "white",
      borderRadius: 10,
    },
    profilePicture: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    commentBar: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      backgroundColor: "#d1d5db",
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: "#ccc",
      alignItems: "center",
      borderRadius: 10,
    },
    menuButton: {
      padding: 8,
    },
    deleteMenu: {
      position: "absolute",
      right: 0,
      top: 40,
      width: 150,
      backgroundColor: bg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: text,
      elevation: 5,
      zIndex: 1000,
    },
    deleteMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
    },
    deleteMenuText: {
      marginLeft: 8,
      fontSize: 16,
      color: text,
    },
  });

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.background} />
        <View style={styles.header}>
          <Ionicons
            name="arrow-back-circle"
            size={40}
            color={text}
            onPress={() => router.push("/(tabs)/forum")}
          />
          <Text style={styles.headerText}>Post Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Post and Comments */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Post */}
          <View style={styles.postCard}>
            {/* User Info */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Image
                source={
                  userProfiles[post.author]?.profilePicture
                    ? { uri: userProfiles[post.author]?.profilePicture }
                    : require("../../assets/images/defaultProfile.jpg")
                }
                style={styles.profilePicture}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 8,
                  color: text,
                }}
              >
                {userProfiles[post.author]?.firstName}
              </Text>
            </View>

            {/* Title and Course Tag */}
            <Text style={{ fontSize: 24, fontWeight: "800", color: text }}>
              {post.title}
            </Text>
            {post.courseTag && (
              <Text
                style={{ fontSize: 16, color: "#888888", marginVertical: 8 }}
              >
                {post.courseTag}
              </Text>
            )}

            {/* Content */}
            <Text
              style={{
                fontSize: 18,
                color: isDarkMode ? "#999999" : "#888888",
                marginVertical: 8,
              }}
            >
              {post.content}
            </Text>

            {/* Timestamp */}
            <Text
              style={{
                fontSize: 14,
                color: isDarkMode ? "#999999" : "#888888",
              }}
            >
              {formatTimestamp(post.createdAt)}
            </Text>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 16,
                }}
                onPress={handlePostUpvote}
              >
                <MaterialCommunityIcons
                  name={
                    postUpvoteStatus?.hasUpvoted
                      ? "thumb-up"
                      : "thumb-up-outline"
                  }
                  size={20}
                  color="#ffc04d"
                />
                <Text style={{ marginLeft: 4, color: text }}>
                  {postUpvoteStatus?.upvoteCount || post.upvoteCount}
                </Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="chatbubble-outline" size={20} color="#ffc04d" />
                <Text style={{ marginLeft: 4, color: text }}>
                  {comments.length}
                </Text>
              </View>
            </View>

            {/* Post Three-Dot Menu */}
            {auth.currentUser?.uid === post.author && (
              <View style={{ position: "absolute", top: 8, right: 8 }}>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setPostMenuVisible(!postMenuVisible)}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={24}
                    color={text}
                  />
                </TouchableOpacity>
                {postMenuVisible && (
                  <View style={styles.deleteMenu}>
                    <TouchableOpacity
                      style={styles.deleteMenuItem}
                      onPress={handleDeletePost}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={20}
                        color={text}
                      />
                      <Text style={styles.deleteMenuText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Comments */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 16,
              marginBottom: 8,
              color: text,
            }}
          >
            Comments
          </Text>
          {comments.length === 0 ? (
            <Text style={{ fontSize: 18, color: "#888888" }}>
              No comments yet.
            </Text>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                    backgroundColor: isDarkMode ? "#999999" : "white",
                  }}
                >
                  <Image
                    source={
                      userProfiles[comment.author]?.profilePicture
                        ? { uri: userProfiles[comment.author]?.profilePicture }
                        : require("../../assets/images/defaultProfile.jpg")
                    }
                    style={styles.profilePicture}
                  />
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", marginLeft: 8 }}
                  >
                    {userProfiles[comment.author]?.firstName}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: isDarkMode ? "#222222" : "#888888",
                    marginBottom: 8,
                  }}
                >
                  {comment.content}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? "#222222" : "#888888",
                    marginBottom: 8,
                  }}
                >
                  {formatTimestamp(comment.createdAt)}
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => handleCommentUpvote(comment.id)}
                >
                  <MaterialCommunityIcons
                    name={
                      commentUpvoteStatuses[comment.id]?.hasUpvoted
                        ? "thumb-up"
                        : "thumb-up-outline"
                    }
                    size={20}
                    color="#ffc04d"
                  />
                  <Text style={{ marginLeft: 4 }}>
                    {commentUpvoteStatuses[comment.id]?.upvoteCount ||
                      comment.upvoteCount}
                  </Text>
                </TouchableOpacity>

                {/* Comment Three-Dot Menu */}
                {auth.currentUser?.uid === comment.author && (
                  <View style={{ position: "absolute", top: 8, right: 8 }}>
                    <TouchableOpacity
                      style={styles.menuButton}
                      onPress={() =>
                        setCommentMenuVisibleId(
                          commentMenuVisibleId === comment.id ? null : comment.id,
                        )
                      }
                    >
                      <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color={text}
                      />
                    </TouchableOpacity>
                    {commentMenuVisibleId === comment.id && (
                      <View style={styles.deleteMenu}>
                        <TouchableOpacity
                          style={styles.deleteMenuItem}
                          onPress={() => handleDeleteComment(comment.id)}
                        >
                          <MaterialCommunityIcons
                            name="trash-can-outline"
                            size={20}
                            color={text}
                          />
                          <Text style={styles.deleteMenuText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
            
        {/* Comment Input Bar */}
        <TouchableOpacity
          style={styles.commentBar}
          onPress={() => router.push(`../forum/${postId}/comment`)}
        >
          <Text style={{ fontSize: 16, color: "#888888" }}>
            Add your comment
          </Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
