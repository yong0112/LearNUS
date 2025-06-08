import { auth } from "@/lib/firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const screenHeight = Dimensions.get("window").height;

export default function Forum() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<
    Record<string, any | undefined>
  >({});
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts and user profiles
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetch("https://learnus.onrender.com/api/forum")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch posts");
            return res.json();
          })
          .then(async (data) => {
            console.log("Posts:", data);
            // Sort posts by createdDate (newest first)
            const sortedPosts = data.sort(
              (a: any, b: any) =>
                new Date(
                  b.createdAt._seconds * 1000 +
                    b.createdAt._nanoseconds / 1000000,
                ).getTime() -
                new Date(
                  a.createdAt._seconds * 1000 +
                    a.createdAt._nanoseconds / 1000000,
                ).getTime(),
            );
            setPosts(sortedPosts);
            const profiles: Record<string, any | undefined> = {};
            await Promise.all(
              sortedPosts.map(async (post: any) => {
                try {
                  const res = await fetch(
                    `https://learnus.onrender.com/api/users/${post.author}`,
                  );
                  if (!res.ok) throw new Error("Failed to fetch user profile");
                  const userData = await res.json();
                  profiles[post.author] = userData;
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setUserProfiles(profiles);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle clicking a post to show details in modal
  const handlePostDetails = (post: any) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedPost(null);
    setModalVisible(false);
  };

  // Navigate to forum_post.tsx
  const handleNewPost = () => {
    router.push("../forum_post");
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.searchBar}>
          <Ionicons name="search-sharp" size={30} color="#ffc04d" />
          <TextInput
            style={{ color: "#888888", fontSize: 17, marginLeft: 5 }}
            placeholder="Search posts by title or course"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Post List */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {posts.length === 0 ? (
          <Text
            style={{ fontSize: 24, fontWeight: "bold", alignSelf: "center" }}
          >
            No posts yet.
          </Text>
        ) : (
          posts.map((post) => {
            const profile = userProfiles[post.author];
            if (!profile) return null;

            return (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => handlePostDetails(post)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 24, fontWeight: "800" }}>
                    {post.title}
                  </Text>
                  {post.courseTag && (
                    <Text style={{ fontSize: 16, color: "#888888" }}>
                      {post.courseTag}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#888888",
                    marginVertical: 5,
                  }}
                  numberOfLines={2}
                >
                  {post.content}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    fontStyle: "italic",
                    color: "#444444",
                  }}
                >
                  Posted by {profile.firstName}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleNewPost}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Post Details Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    alignSelf: "stretch",
                    marginBottom: 30,
                  }}
                >
                  <TouchableOpacity onPress={closeModal}>
                    <Ionicons name="arrow-back" size={30} color="orange" />
                  </TouchableOpacity>
                </View>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "600",
                    alignSelf: "center",
                  }}
                >
                  {selectedPost.title}
                </Text>
                {selectedPost.courseTag && (
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "600",
                      marginTop: 25,
                      alignSelf: "center",
                    }}
                  >
                    {selectedPost.courseTag}
                  </Text>
                )}
                <Text style={{ fontSize: 18, color: "#888888", marginTop: 10 }}>
                  {selectedPost.content}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginTop: 15,
                    color: "#444444",
                  }}
                >
                  Posted by: {userProfiles[selectedPost.author]?.firstName}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 10,
    justifyContent: "flex-start",
  },
  searchBar: {
    flex: 1,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#d1d5db",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  postCard: {
    marginBottom: 20,
    flexDirection: "column",
    borderBottomWidth: 2,
    borderBottomColor: "gray",
    paddingBottom: 10,
  },
  modalOverlay: {
    padding: 20,
    alignItems: "center",
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "97%",
    height: screenHeight * 0.95,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    alignItems: "flex-start",
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    alignSelf: "center",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#000000",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  fabText: {
    color: "white",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "bold",
  },
});
