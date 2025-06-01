import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Chat() {
const router = useRouter();

const handleNewPost = () => {
router.push("../forum_post");
};

return (
<View style={styles.container}>
<Text style={styles.header}>Forum</Text>
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
paddingHorizontal: 20,
},
header: {
fontSize: 30,
fontWeight: "600",
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
