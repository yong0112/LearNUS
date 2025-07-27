import { FAQ } from "@/constants/types";
import { useThemeColor } from "@/hooks/useThemeColor";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function faq() {
  const router = useRouter();
  const [faq, setFaq] = useState<FAQ[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {},
  );
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  useEffect(() => {
    const fetchConstants = async () => {
      fetch("https://learnus.onrender.com/api/constants")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch constants");
          return res.json();
        })
        .then((data) => {
          setFaq(data.FAQ);
        })
        .catch((err) => {
          console.error(err);
        });
    };

    fetchConstants();
  }, []);

  const toggleExpanded = (ind: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [ind]: !prev[ind],
    }));
  };

  const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    headings: {
      fontSize: 24,
      fontWeight: 600,
      marginVertical: 10,
    },
    questionContainer: {
      paddingVertical: 10,
      flexDirection: "column",
      borderBottomColor: "gray",
      borderBottomWidth: 1,
    },
    titleContainer: {
      flexDirection: "row",
      paddingHorizontal: 5,
      justifyContent: "space-between",
      marginVertical: 5,
    },
    titleText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    ansText: {
      fontSize: 16,
      fontWeight: "semibold",
      color: "#0e66beff",
    },
  });

  return (
    <View style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerText}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Body */}
      <View>
        <Text style={styles.headings}>Frequently Asked Questions</Text>
        {faq && faq.length > 0 ? (
          faq.map((ques: FAQ, index: number) => {
            const isExtended = expandedItems[index] || false;
            return (
              <View key={index} style={styles.questionContainer}>
                <TouchableOpacity
                  style={styles.titleContainer}
                  onPress={() => toggleExpanded(index)}
                >
                  <Text style={styles.titleText}>{ques.title}</Text>
                  {isExtended ? (
                    <AntDesign name="up" size={25} />
                  ) : (
                    <AntDesign name="down" size={25} />
                  )}
                </TouchableOpacity>
                {isExtended ? (
                  <View>
                    <Text style={styles.ansText}>{ques.ans}</Text>
                  </View>
                ) : (
                  <View />
                )}
              </View>
            );
          })
        ) : (
          <View />
        )}
      </View>
    </View>
  );
}
