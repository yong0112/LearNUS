import { auth, db } from "@/lib/firebase";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { use, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { doc, getDoc } from "firebase/firestore";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const screenHeight = Dimensions.get("window").height;

interface CourseOption {
  label: string;
  value: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  courseTag?: string;
  author: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  upvoteCount: number;
}

interface UserProfile {
  firstName: string;
  profilePicture?: string;
}

interface UpvoteStatus {
  upvoteCount: number;
  hasUpvoted: boolean;
}

export default function Forum() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [seraching, setSearching] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [userProfiles, setUserProfiles] = useState<
    Record<string, UserProfile | undefined>
  >({});
  const [upvoteStatus, setUpvoteStatus] = useState<
    Record<string, UpvoteStatus>
  >({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(
    {},
  );
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "https://learnus.onrender.com";

  // Fetch posts and user profiles
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetch("https://learnus.onrender.com/api/forum")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch posts");
            return res.json();
          })
          .then(async (data: ForumPost[]) => {
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
            setFilteredPosts(sortedPosts);

            const profiles: Record<string, any | undefined> = {};
            await Promise.all(
              sortedPosts.map(async (post: any) => {
                try {
                  const userRes = await fetch(
                    `https://learnus.onrender.com/api/users/${post.author}`,
                  );
                  if (!userRes.ok)
                    throw new Error("Failed to fetch user profile");
                  const userData: UserProfile = await userRes.json();
                  const userDoc = await getDoc(doc(db, "users", post.author));
                  if (userDoc.exists()) {
                    profiles[post.author] = {
                      ...userData,
                      profilePicture: userDoc.data().profilePicture,
                    };
                  } else {
                    profiles[post.author] = userData;
                  }
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setUserProfiles(profiles);

            // Fetch upvote status and comment counts
            const upvoteStatus: Record<string, UpvoteStatus> = {};
            const commentCounts: Record<string, number> = {};
            await Promise.all(
              sortedPosts.map(async (post: any) => {
                try {
                  if (currentUser.uid) {
                    const upvoteRes = await fetch(
                      `${BASE_URL}/api/forum/${post.id}/upvote-status/${currentUser.uid}`,
                    );
                    if (upvoteRes.ok) {
                      upvoteStatus[post.id] = await upvoteRes.json();
                    }
                  }

                  const commentsRes = await fetch(
                    `${BASE_URL}/api/forum/${post.id}/comments`,
                  );
                  if (commentsRes.ok) {
                    const comments = await commentsRes.json();
                    commentCounts[post.id] = comments.length;
                  }
                } catch (err) {
                  console.error(err);
                }
              }),
            );
            setUpvoteStatus(upvoteStatus);
            setCommentCounts(commentCounts);
          })
          .catch((err) => {
            console.error(err);
            setError(err.message);
          });

        //Fetch course from nusmods
        fetch("https://api.nusmods.com/v2/2024-2025/moduleList.json")
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch local courses");
            return res.json();
          })
          .then((data) => {
            return data.map(
              (course: {
                moduleCode: string;
                title: string;
                semesters: number[];
              }) => ({
                label: `${course.moduleCode} - ${course.title}`,
                value: course.moduleCode,
              }),
            );
          })
          .then((data) => {
            setCourseOptions(data);
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        setPosts([]);
        setFilteredPosts([]);
        setCourseOptions([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Filter posts based on course tag
  useEffect(() => {
    const filtered = posts.filter((post) => {
      if (!selectedCourse) return true; // Show all posts if no course selected
      return (
        post.courseTag &&
        post.courseTag.toLowerCase().includes(selectedCourse.toLowerCase())
      );
    });
    setFilteredPosts(filtered);
  }, [selectedCourse, posts]);

  // Handle upvote toggle
  const handleUpvote = async (postId: string) => {
    if (!auth.currentUser) {
      alert("Please log in to upvote");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/forum/${postId}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid }),
      });
      if (!res.ok) throw new Error("Failed to toggle upvote");
      const result: UpvoteStatus = await res.json();
      setUpvoteStatus((prev) => ({ ...prev, [postId]: result }));
    } catch (err) {
      console.error(err);
      alert("Failed to upvote");
    }
  };

  // Navigate to post details
  const handlePostDetails = (postId: string) => {
    router.push(`../forum/${postId}`);
  };

  // Handle clicking a post to show details in modal
  // const handlePostDetails = (post: any) => {
  //   setSelectedPost(post);
  //   setModalVisible(true);
  // };

  // // Close the modal
  // const closeModal = () => {
  //   setSelectedPost(null);
  //   setModalVisible(false);
  // };

  // Navigate to forum_post.tsx
  const handleNewPost = () => {
    router.push("../forum_post");
  };

  // Handle search
  const handleSearch = () => {
    setSearchText(seraching);
  };

  // Handle filter button toggle
  const handleFilterToggle = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  // Handle clear filter
  const handleClearFilter = () => {
    setSelectedCourse("");
    setIsFilterVisible(false);
  };

  //Search and filter
  const displayedPosts = filteredPosts.filter((post) => {
    const profile = userProfiles[post.author];
    if (!profile) return null;
    return (
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.content.toLowerCase().includes(searchText.toLowerCase()) ||
      (post.courseTag &&
        post.courseTag.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={() => {
              setSearchText("");
              setSearching("");
            }}
          >
            <Entypo name="cross" size={25} color="#444444" />
          </TouchableOpacity>
          <TextInput
            style={{ flex: 1, color: "#888888", fontSize: 17, marginLeft: 5 }}
            placeholder="Search posts by title or course"
            value={seraching}
            onChangeText={setSearching}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search-sharp" size={30} color="#ffc04d" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterToggle}
        >
          <MaterialCommunityIcons
            name="filter-outline"
            size={20}
            color="black"
          />
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Course Filter Dropdown */}
      {isFilterVisible && (
        <View style={styles.filterWrapper}>
          <View style={styles.searchBar}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={courseOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select a course tag"
              value={selectedCourse}
              onChange={(item) => {
                if (item.value === selectedCourse) {
                  handleClearFilter(); // Reset if same course is selected
                } else {
                  setSelectedCourse(item.value);
                  setIsFilterVisible(false);
                }
              }}
              renderLeftIcon={() => (
                <Ionicons color={"#ffc04d"} name="search-sharp" size={30} />
              )}
              search
              searchPlaceholder="Search course"
            />
          </View>
          <TouchableOpacity
            style={styles.clearFilterContainer}
            onPress={() => {
              handleClearFilter();
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color="black" />
            <Text style={styles.buttonText}>Clear Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Post List */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {posts.length === 0 ? (
          <Text
            style={{ fontSize: 24, fontWeight: "bold", alignSelf: "center" }}
          >
            No posts yet.
          </Text>
        ) : (
          displayedPosts.map((post) => {
            const profile = userProfiles[post.author];
            if (!profile) return null;

            return (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => handlePostDetails(post.id)}
              >
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
                      profile.profilePicture
                        ? { uri: profile.profilePicture }
                        : require("../../assets/images/defaultProfile.jpg") // Adjust path to your default avatar
                    }
                    style={styles.profilePicture}
                  />
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", marginLeft: 8 }}
                  >
                    {profile.firstName}
                  </Text>
                </View>

                {/* Title and Course Tag */}
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

                {/* Content */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#888888",
                    marginVertical: 8,
                  }}
                  numberOfLines={2}
                >
                  {post.content}
                </Text>

                {/* Action Buttons */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                    onPress={() => handleUpvote(post.id)}
                  >
                    <MaterialCommunityIcons
                      name={
                        upvoteStatus[post.id]?.hasUpvoted
                          ? "thumb-up"
                          : "thumb-up-outline"
                      }
                      size={20}
                      color="#ffc04d"
                    />
                    <Text style={{ marginLeft: 4 }}>
                      {upvoteStatus[post.id]?.upvoteCount || post.upvoteCount}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => handlePostDetails(post.id)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#ffc04d"
                    />
                    <Text style={{ marginLeft: 4 }}>
                      {commentCounts[post.id] || 0}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleNewPost}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  filterWrapper: {
    marginLeft: 8,
  },
  searchBar: {
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#d1d5db",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  filterButton: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  buttonText: {
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 2,
  },
  dropdown: {
    height: 50,
    flex: 1,
    paddingRight: 8,
  },
  placeholderStyle: {
    fontSize: 17,
    marginLeft: 10,
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 17,
    marginLeft: 10,
    color: "#222",
  },
  clearFilterContainer: {
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    alignSelf: "flex-start",
  },
  postCard: {
    marginBottom: 20,
    flexDirection: "column",
    borderBottomWidth: 2,
    borderBottomColor: "gray",
    paddingBottom: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
