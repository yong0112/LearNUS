import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TutorPost() {
    const router = useRouter();

    const handlePosting = () => {

    }

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Ionicons name='arrow-back-circle' size={40} color='#ffc04d' onPress={() => router.push('/(tabs)/home')} />
                <Text style={styles.headerText}>Tutor Posting</Text>
                <View style={{ width: 40 }}/>
            </View>

            <View style={{ flexDirection: 'column', paddingTop: 20, paddingHorizontal: 10 }}>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Course Code</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name='search-sharp' size={30} color='#ffc04d' onPress={() => router.push('/+not-found')} />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10 }} placeholder='Course code'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Location</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name='search-sharp' size={30} color='#ffc04d' onPress={() => router.push('/+not-found')} />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10 }} placeholder='Physical / Online'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>About the lesson</Text>
                    <View style={styles.searchBar}>
                        <TextInput style={{ color: '#888888', fontSize: 14, marginLeft: 10, height: 35, flex: 1 }} placeholder='Brief description about the lesson...'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Availability, eg.(Monday 7-9pm)</Text>
                    <View style={styles.searchBar}>
                        <TextInput style={{ color: '#888888', fontSize: 14, marginLeft: 10, height: 35, flex: 1 }} placeholder='Time slots'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Hourly Rate</Text>
                    <View style={styles.searchBar}>
                        <FontAwesome name='dollar' size={25} color='black' onPress={() => router.push('/+not-found')} />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10 }} keyboardType='decimal-pad' placeholder='Singapore dollar'/>
                    </View>
                </View>
                <TouchableOpacity style={styles.postButton} onPress={handlePosting}>
                    <Text style={styles.buttonText}>Post!</Text>
                </ TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 20, paddingHorizontal: 10, justifyContent: 'flex-start' },
    headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black'
    },
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
    postButton: {
        marginTop: 20,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        backgroundColor: 'orange'
    },
    buttonText: { marginHorizontal: 4, fontSize: 28, fontWeight: '600', marginBottom: 2, color: 'white' },
})