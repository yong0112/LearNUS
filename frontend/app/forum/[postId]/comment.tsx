import { auth, db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ForumPost {
  id: string;
  title: string;
}

interface UserProfile {
  firstName: string;
}

export default function Comment() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [authorName, setAuthorName] = useState<string | null>(null);

  const BASE_URL = "https://learnus.onrender.com";
  const MAX_COMMENT_LENGTH = 500;

  // Fetch post and author name
  useEffect(() => {
    if (!postId || typeof postId !== "string") return;

    const fetchData = async () => {
      try {
        // Fetch post
        const postRes = await fetch(`${BASE_URL}/api/forum`);
        if (!postRes.ok) throw new Error("Failed to fetch post");
        const posts: ForumPost[] = await postRes.json();
        const foundPost = posts.find((p) => p.id === postId);
        if (foundPost) setPost(foundPost);

        // Fetch author name
        if (auth.currentUser) {
          const userRes = await fetch(
            `${BASE_URL}/api/users/${auth.currentUser.uid}`,
          );
          if (userRes.ok) {
            const userData: UserProfile = await userRes.json();
            setAuthorName(userData.firstName);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [postId]);

  // Handle comment submission
  const handlePostComment = async () => {
    if (!auth.currentUser) {
      Alert.alert("Please log in to comment");
      return;
    }
    if (!postId || typeof postId !== "string") return;
    if (!commentContent.trim()) {
      Alert.alert("Comment cannot be empty");
      return;
    }
    if (commentContent.length > MAX_COMMENT_LENGTH) {
      Alert.alert(`Comment exceeds ${MAX_COMMENT_LENGTH} characters`);
      return;
    }
    if (!authorName) {
      Alert.alert("Failed to fetch author name");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/forum/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentContent,
          author: auth.currentUser.uid,
          authorName,
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      Alert.alert("Comment posted!");
      router.replace(`../../forum/${postId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to post comment");
    }
  };

  // Update character count
  const handleCommentChange = (text: string) => {
    setCommentContent(text);
    setCharCount(text.length);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={30}
          color="orange"
          onPress={() => router.push(`../../forum/${postId}`)}
        />
        <Text style={styles.headerText}>Add comment</Text>
        <TouchableOpacity onPress={handlePostComment}>
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Post Title */}
      {post && <Text style={styles.postTitle}>{post.title}</Text>}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Comment Input */}
      <TextInput
        style={styles.commentInput}
        placeholder="Write your comment here..."
        placeholderTextColor="#888"
        multiline
        value={commentContent}
        onChangeText={handleCommentChange}
        maxLength={MAX_COMMENT_LENGTH}
      />

      {/* Character Count */}
      <Text style={styles.charCount}>
        {charCount}/{MAX_COMMENT_LENGTH}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "orange",
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#d1d5db",
    padding: 16,
    fontSize: 16,
    color: "#222",
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 14,
    color: "#888",
    textAlign: "right",
    marginTop: 8,
  },
});
