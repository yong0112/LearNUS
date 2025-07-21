// components/SearchBar.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

interface SearchBarProps {
  placeholder: string;
  onSearch: (text: string) => void;
  fontSize?: number;
  initialValue?: string;
  style?: object;
}

export default function SearchBar({
  placeholder,
  onSearch,
  fontSize = 17,
  initialValue = "",
  style,
}: SearchBarProps) {
  const [searchText, setSearchText] = useState(initialValue);
  const textColor = useThemeColor({}, "text");

  const handleClear = () => {
    setSearchText("");
    onSearch("");
  };

  const handleSearch = () => {
    onSearch(searchText);
  };

  return (
    <View style={[styles.searchBar, style]}>
      <TouchableOpacity onPress={handleClear}>
        <Entypo name="cross" size={25} color="#444444" />
      </TouchableOpacity>
      <TextInput
        style={{ flex: 1, color: "#888888", fontSize, marginLeft: 5 }}
        placeholder={placeholder}
        value={searchText}
        onChangeText={setSearchText}
      />
      <TouchableOpacity onPress={handleSearch}>
        <Ionicons name="search-sharp" size={30} color="#ffc04d" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#d1d5db",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
});
