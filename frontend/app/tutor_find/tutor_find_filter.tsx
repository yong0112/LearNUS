import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { LocationOption } from "../../constants/types";
import { useTheme } from "@/components/ThemedContext";

const screenWidth = Dimensions.get("window").width;

export default function TutorFilter() {
  const router = useRouter();
  const [locationOption, setLocationOption] = useState<LocationOption[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [ratings, setRatings] = useState<number[]>();
  const [rate, setRate] = useState([0, 100]);
  const { isDarkMode } = useTheme();
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
          console.log(data.FORMATS);
          setLocationOption(data.FORMATS);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    fetchConstants();
  }, []);

  const handleClearing = () => {
    setSelectedLocation("");
    setRatings([0]);
    setRate([0, 100]);
  };

  const handleFiltering = () => {
    router.push({
      pathname: "/tutor_find",
      params: {
        location: selectedLocation,
        ratings: ratings,
        minRate: rate[0],
        maxRate: rate[1],
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
      paddingBottom: 50,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
    },
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
    title: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 5,
      color: text,
    },
    optionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 10,
    },
    optionBox: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: "#f0f0f0",
      borderWidth: 2,
      borderColor: "#ccc",
    },
    optionBoxSelected: {
      backgroundColor: "#ffc04d",
      borderColor: "#ff9900",
    },
    optionText: {
      fontSize: 12,
      fontWeight: "500",
      color: "gray",
    },
    optionTextSelected: {
      color: "white",
      fontWeight: "700",
    },
    rate: {
      fontSize: 16,
      fontWeight: "600",
      color: text,
    },
    applyButton: {
      backgroundColor: "#ffbf00",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      width: 150,
    },
    clearButton: {
      borderWidth: 2,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      width: 150,
      backgroundColor: isDarkMode ? "#999999" : "transparent",
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "black",
      textAlign: "center",
    },
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/**Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={20} color={text} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Filter</Text>
          <View style={{ width: 40 }} />
        </View>

        <View
          style={{
            justifyContent: "flex-start",
            flexDirection: "column",
            paddingTop: 20,
            paddingHorizontal: 10,
          }}
        >
          {/**Location */}
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Location</Text>
            <View style={styles.optionContainer}>
              {locationOption.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionBox,
                    selectedLocation == option.value &&
                      styles.optionBoxSelected,
                  ]}
                  onPress={() => setSelectedLocation(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedLocation == option.value &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/**Ratings */}
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Ratings</Text>
            <MultiSlider
              values={ratings}
              sliderLength={screenWidth * 0.8}
              onValuesChange={setRatings}
              min={0}
              max={5.0}
              step={0.1}
              selectedStyle={{ backgroundColor: "orange" }}
              unselectedStyle={{ backgroundColor: "#e0e0e0" }}
              markerStyle={{
                backgroundColor: "orange",
                height: 24,
                width: 24,
              }}
            />

            <View style={{ padding: 20, justifyContent: "flex-start" }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: text }}>
                Rating above {ratings ? ratings[0].toFixed(1) : "0.0"}
              </Text>
            </View>
          </View>

          {/**Hourly Rate */}
          <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
            <Text style={styles.title}>Hourly Rate (in SGD)</Text>
            <MultiSlider
              values={rate}
              sliderLength={screenWidth * 0.8}
              onValuesChange={setRate}
              min={0}
              max={100}
              step={1}
              selectedStyle={{ backgroundColor: "orange" }}
              unselectedStyle={{ backgroundColor: "#e0e0e0" }}
              markerStyle={{
                backgroundColor: "orange",
                height: 24,
                width: 24,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                padding: 20,
                justifyContent: "space-between",
                width: screenWidth * 0.8,
              }}
            >
              <Text style={styles.rate}>Min: S${rate[0]}</Text>
              <Text style={styles.rate}>Max: S${rate[1]}</Text>
            </View>
          </View>

          {/**Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearing}
            >
              <Text style={styles.buttonText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleFiltering}
            >
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
