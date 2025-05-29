import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

export default function CalendarPage() {
  const [selected, setSelected] = useState("");

  const handleAddEvent = (day: string) => {
    console.log("Event adding... on" + { day });
  };

  const handleAddEventButton = () => {
    console.log("Event adding...");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Calendar</Text>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <Calendar
          markingType="custom"
          onDayPress={(day) => {
            setSelected(day.dateString);
            handleAddEvent(day.dateString);
          }}
          markedDates={{
            [selected]: {
              selected: true,
              dotColor: "white",
              customStyles: {
                container: {
                  backgroundColor: "orange",
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignSelf: "center",
                  justifyContent: "center",
                },
              },
            },
          }}
          style={styles.calendar}
          theme={{
            backgroundColor: "#000000",
            calendarBackground: "#ffffff",
            textSectionTitleColor: "#b6c1cd",
            selectedDayBackgroundColor: "orange",
            selectedDayTextColor: "#ffffff",
            todayTextColor: "orange",
            dayTextColor: "black",
            textDisabledColor: "lightgray",
            arrowColor: "orange",
            textDayFontWeight: "300",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "600",
            textDayFontSize: 18,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
            arrowWidth: 40,
            dotColor: "black",
          }}
        />
        <TouchableOpacity style={styles.plus} onPress={handleAddEventButton}>
          <AntDesign name="pluscircle" size={50} color={"orange"} />
        </TouchableOpacity>
      </View>
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
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 10,
  },
  calendar: {
    borderWidth: 1,
    borderColor: "gray",
    height: 350,
  },
  plus: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
