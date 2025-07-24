import { auth, db } from "@/lib/firebase";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { use, useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { doc, getDoc } from "firebase/firestore";
import {
  CourseOption,
  ForumPost,
  UserProfile,
  UpvoteStatus,
} from "../../constants/types";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedView } from "@/components/ThemedView";
import SearchBar from "../../components/SearchBar";
import { getTagColor } from "@/constants/tagColors";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function Forum() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [searching, setSearching] = useState("");
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
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuVisiblePostId, setMenuVisiblePostId] = useState<string | null>(
    null,
  );
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  const BASE_URL = "https://learnus.onrender.com";

  // Fetch posts and user profiles
  const fetchData = useCallback(() => {
    const currentUser = auth.currentUser;

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
                profiles[post.author] = userData;
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

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

    if (!selectedCourse) {
      setIsFiltered(false);
    } else {
      setIsFiltered(true);
    }
  }, [selectedCourse, posts]);

  // Handle upvote toggle
  const handleUpvote = async (postId: string) => {
    if (!auth.currentUser) {
      Alert.alert("Please log in to upvote");
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
      Alert.alert("Failed to upvote");
    }
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!auth.currentUser) {
      alert("Please log in to delete a post");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/forum/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: auth.currentUser.uid }),
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setFilteredPosts((prev) => prev.filter((post) => post.id !== postId));
      setMenuVisiblePostId(null); //Close menu after deletion
      Alert.alert("Post deleted successfully");
      router.replace("/home/forum");
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to delete post");
    }
  };

  // Navigate to post details
  const handlePostDetails = (postId: string) => {
    router.push(`../forum/${postId}`);
  };

  // Navigate to forum_post.tsx
  const handleNewPost = () => {
    router.push("/forum/forum_post");
  };

  // Handle search
  const handleSearch = () => {
    setSearchText(searching);
  };

  // Handle filter button toggle
  const handleFilterToggle = () => {
    if (isFiltered) {
      setIsFiltered(false);
      setSelectedCourse("");
    } else {
      setIsFilterVisible(true);
    }
  };

  //Search and filter
  const displayedPosts = filteredPosts.filter((post: ForumPost) => {
    const profile = userProfiles[post.author];
    if (!profile) return false; // Return false instead of null for filter
    return (
      post.title.toLowerCase().includes(searchText.toLowerCase()) ||
      post.content.toLowerCase().includes(searchText.toLowerCase()) ||
      (post.courseTag &&
        post.courseTag.toLowerCase().includes(searchText.toLowerCase()))
    );
  });

  const menuItems = [
    {
      label: "Delete",
      value: "delete",
      icon: (
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={20}
          color={text}
        />
      ),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
      paddingHorizontal: 10,
      justifyContent: "flex-start",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingTop: 10,
      borderBottomColor: "gray",
      borderBottomWidth: 0.5,
    },
    headerText: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 10,
      color: text,
    },
    filterWrapper: {
      marginLeft: 8,
      flex: 1,
    },
    searchBar: {
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: "#d1d5db",
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 8,
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
      borderColor: isFiltered ? "#b35d02ff" : "gray",
    },
    buttonText: {
      marginHorizontal: 4,
      fontSize: 14,
      fontWeight: "400",
      marginBottom: 2,
      color: isFiltered ? "#b35d02ff" : "gray",
    },
    buttonBadge: {
      position: "absolute",
      top: 4,
      left: 23,
      width: 10,
      height: 10,
      borderRadius: 20,
      backgroundColor: "#b35d02ff",
    },
    dropdown: {
      height: 40,
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
    postCard: {
      marginBottom: 20,
      flexDirection: "column",
      borderBottomWidth: 2,
      borderBottomColor: "gray",
      paddingBottom: 10,
    },
    profilePicture: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    fab: {
      position: "absolute",
      bottom: screenHeight * 0.05,
      right: 20,
      backgroundColor: "orange",
      width: 55,
      height: 55,
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
    menuButton: {
      padding: 3,
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
    courseTagContainer: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      alignSelf: "flex-start",
      marginVertical: 8,
      opacity: 0.8,
    },
    courseTagText: {
      fontSize: 14,
      fontWeight: "500",
      color: "#FFFFFF",
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/**Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Discussion Forum</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <SearchBar
            placeholder="Search posts by title or course"
            onSearch={setSearchText}
            fontSize={17}
            style={{ marginTop: 12, marginBottom: 12 }}
          />
        </View>

        {/* Filter Button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            paddingVertical: 5,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterToggle}
          >
            <MaterialCommunityIcons
              name="filter-outline"
              size={20}
              color={isFiltered ? "#b35d02ff" : "gray"}
            />
            {isFiltered && <View style={styles.buttonBadge} />}
            <Text style={styles.buttonText}>Filter</Text>
          </TouchableOpacity>

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
                    setSelectedCourse(item.value);
                    setIsFilterVisible(false);
                  }}
                  renderLeftIcon={() => (
                    <Ionicons color={"#ffc04d"} name="search-sharp" size={30} />
                  )}
                  search
                  searchPlaceholder="Search course"
                />
              </View>
            </View>
          )}
        </View>

        {/* Post List */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {posts.length === 0 ? (
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                alignSelf: "center",
                color: text,
              }}
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
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        marginLeft: 8,
                        color: text,
                      }}
                    >
                      {profile.firstName}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Title */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: text,
                        width: screenWidth * 0.7,
                      }}
                    >
                      {post.title}
                    </Text>

                    {/* Course Tag */}
                    {post.courseTag && (
                      <View
                        style={[
                          styles.courseTagContainer,
                          { backgroundColor: getTagColor(post.courseTag) },
                        ]}
                      >
                        <Text style={styles.courseTagText}>
                          {post.courseTag}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Content */}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#888888",
                      marginVertical: 2,
                      marginBottom: 8,
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
                      <Text style={{ marginLeft: 4, color: text }}>
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
                      <Text style={{ marginLeft: 4, color: text }}>
                        {commentCounts[post.id] || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Three-Dot Menu */}
                  {auth.currentUser?.uid === post.author && (
                    <View style={{ position: "absolute", top: 0, right: 0 }}>
                      <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() =>
                          setMenuVisiblePostId(
                            menuVisiblePostId === post.id ? null : post.id,
                          )
                        }
                      >
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={24}
                          color={text}
                        />
                      </TouchableOpacity>
                      {menuVisiblePostId === post.id && (
                        <View style={styles.deleteMenu}>
                          <TouchableOpacity
                            style={styles.deleteMenuItem}
                            onPress={() => handleDeletePost(post.id)}
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
    </ThemedView>
  );
}
