import { TemporaryClass } from "@/constants/types";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { auth } from "@/lib/firebase";
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function bookingStatus() {
  const router = useRouter();
  const STATUS = ["Pending", "Accepted", "Paid", "Confirmed"];
  const [session, setSession] = useState<TemporaryClass>();
  const [curr, setCurr] = useState<number>();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme == "dark";
  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currUser) => {
      if (currUser) {
        setCurr(0);
        fetch(
          `https://learnus.onrender.com/api/users/${currUser.uid}/classes/${id}`,
        )
          .then((res) => {
            if (!res.ok) throw new Error("Fail to fetch user classes");
            return res.json();
          })
          .then((data) => {
            setSession(data);
            console.log(data);
            const ind = STATUS.includes(data.status)
              ? STATUS.indexOf(data.status)
              : -1;
            setCurr(ind);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        setSession(undefined);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptance = () => {
    router.push({
      pathname: "/profile/booking/bookingAcceptance",
      params: {
        id: id,
      },
    });
  };

  const handlePayment = () => {
    router.push({
      pathname: "/profile/booking/paymentPrompt",
      params: {
        id: id,
      },
    });
  };

  const handleConfirmation = () => {
    router.push({
      pathname: "/profile/booking/confirmation",
      params: {
        id: id,
      },
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    headerText: {
      fontSize: 28,
      fontWeight: "bold",
      alignItems: "center",
      justifyContent: "center",
      color: text,
    },
    body: {
      marginTop: 20,
      flexDirection: "column",
      backgroundColor: "#aaa7ad",
    },
    wrappingBar: {
      flexDirection: "column",
    },
    statusBarDone: {
      flexDirection: "row",
      paddingHorizontal: 25,
      paddingVertical: 8,
      backgroundColor: "white",
      borderTopWidth: 1,
      borderTopColor: "gray",
    },
    statusBarUndone: {
      flexDirection: "row",
      paddingHorizontal: 25,
      paddingVertical: 8,
      backgroundColor: "#c5c6c7",
      borderTopWidth: 1,
      borderTopColor: "gray",
    },
    statusBarTextDone: {
      fontSize: 16,
      fontWeight: "semibold",
      marginLeft: 10,
    },
    statusBarTextUndone: {
      fontSize: 16,
      fontWeight: "semibold",
      marginLeft: 10,
      color: "gray",
    },
    actionBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      backgroundColor: "#c5c6c7",
    },
    actionButton: {
      flexDirection: "row",
      paddingHorizontal: 5,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    actionText: {
      fontSize: 14,
      color: "#dd571c",
    },
  });

  return (
    <ThemedView style={styles.container}>
      {/**Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back-circle"
          size={40}
          color="orange"
          onPress={() => router.push("/profile/history")}
        />
        <Text style={styles.headerText}>Booking status</Text>
        <View style={{ width: 40 }} />
      </View>

      {/**Booking status */}
      <View style={styles.body}>
        {curr != undefined && curr >= 0 ? (
          curr > 0 ? (
            <View style={styles.statusBarDone}>
              <AntDesign name="checkcircle" color={"green"} size={20} />
              <Text style={styles.statusBarTextDone}>
                Booking is accepted by tutor.
              </Text>
            </View>
          ) : (
            <View style={styles.wrappingBar}>
              <View style={styles.statusBarUndone}>
                <AntDesign name="checkcircle" color={"gray"} size={20} />
                <Text style={styles.statusBarTextUndone}>
                  Booking is pending for tutor acceptance.
                </Text>
              </View>
              <View style={styles.actionBar}>
                {session?.role == "Tutor" ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleAcceptance}
                  >
                    <Text style={styles.actionText}>Action required</Text>
                    <MaterialIcons
                      name="arrow-right"
                      size={20}
                      color={"#dd571c"}
                    />
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
              </View>
            </View>
          )
        ) : (
          <View />
        )}
        {curr != undefined && curr >= 0 ? (
          curr > 1 ? (
            <View style={styles.statusBarDone}>
              <AntDesign name="checkcircle" color={"green"} size={20} />
              <Text style={styles.statusBarTextDone}>
                Payment has been made by student.
              </Text>
            </View>
          ) : (
            <View style={styles.wrappingBar}>
              <View style={styles.statusBarUndone}>
                <AntDesign name="checkcircle" color={"gray"} size={20} />
                <Text style={styles.statusBarTextUndone}>
                  Pending for student payment.
                </Text>
              </View>
              <View style={styles.actionBar}>
                {session?.role == "Student" ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handlePayment}
                  >
                    <Text style={styles.actionText}>Action required</Text>
                    <MaterialIcons
                      name="arrow-right"
                      size={20}
                      color={"#dd571c"}
                    />
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
              </View>
            </View>
          )
        ) : (
          <View />
        )}
        {curr != undefined && curr >= 0 ? (
          curr > 2 ? (
            <View style={styles.statusBarDone}>
              <AntDesign name="checkcircle" color={"green"} size={20} />
              <Text style={styles.statusBarTextDone}>
                Payment received by tutor.
              </Text>
            </View>
          ) : (
            <View style={styles.wrappingBar}>
              <View style={styles.statusBarUndone}>
                <AntDesign name="checkcircle" color={"gray"} size={20} />
                <Text style={styles.statusBarTextUndone}>
                  Pending for tutor to confirm payment received.
                </Text>
              </View>
              <View style={styles.actionBar}>
                {session?.role == "Tutor" ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleConfirmation}
                  >
                    <Text style={styles.actionText}>Action required</Text>
                    <MaterialIcons
                      name="arrow-right"
                      size={20}
                      color={"#dd571c"}
                    />
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
              </View>
            </View>
          )
        ) : (
          <View />
        )}
        {curr != undefined && curr >= 0 ? (
          curr > 2 ? (
            <View style={styles.statusBarDone}>
              <AntDesign name="checkcircle" color={"green"} size={20} />
              <Text style={styles.statusBarTextDone}>
                Booking is confirmed.
              </Text>
            </View>
          ) : (
            <View style={styles.statusBarUndone}>
              <AntDesign name="checkcircle" color={"gray"} size={20} />
              <Text style={styles.statusBarTextUndone}>
                Booking is not confirmed.
              </Text>
            </View>
          )
        ) : (
          <View />
        )}

        {/**Rejected */}
        {curr != undefined ? (
          curr < 0 ? (
            <View style={styles.statusBarDone}>
              <Entypo name="circle-with-cross" color={"red"} size={20} />
              <Text style={styles.statusBarTextDone}>
                Booking is rejected by tutor.
              </Text>
            </View>
          ) : (
            <View />
          )
        ) : (
          <View />
        )}
        {curr != undefined ? (
          curr < 0 ? (
            <View style={styles.statusBarDone}>
              <Entypo name="circle-with-cross" color={"red"} size={20} />
              <Text style={styles.statusBarTextDone}>Booking cancelled.</Text>
            </View>
          ) : (
            <View />
          )
        ) : (
          <View />
        )}
      </View>
    </ThemedView>
  );
}
