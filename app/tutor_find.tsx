import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function tutoring() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name='arrow-back-circle' size={40} color='#ffc04d' onPress={() => router.push('/(tabs)/home')} />
                <View style={styles.searchBar}>
                    <Ionicons name='search-sharp' size={30} color='#ffc04d' onPress={() => router.push('/+not-found')} />
                    <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10 }} placeholder='Search'/>
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 12,  }}>
                <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/+not-found')}>
                    <MaterialCommunityIcons name="filter-outline" size={24} color="black" />
                    <Text style={styles.buttonText}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/+not-found')}>
                    <MaterialCommunityIcons name="sort" size={24} color="black" />
                    <Text style={styles.buttonText}>Sort</Text>
                    <FontAwesome name="angle-down" size={24} color="#9ca3af" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 20, paddingHorizontal: 10, justifyContent: 'flex-start' },
    searchBar: { 
        flex: 1, 
        padding: 10, 
        borderRadius: 20, 
        backgroundColor: '#d1d5db', 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginLeft: 8, 
        height: 50 
    },  
    filterButton: {
        borderRadius: 10,
        padding: 10,
        borderWidth: 1,
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        marginHorizontal: 6
    },
    buttonText: { marginHorizontal: 4, fontSize: 14, fontWeight: '400', marginBottom: 2 },
})