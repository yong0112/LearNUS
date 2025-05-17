import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TutorPost() {
    const router = useRouter();

    const handlePosting = () => {
        console.log("Post!")
    }

    return (
        <View style={styles.container}>
            <View style={styles.background}/>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Ionicons name='arrow-back-circle' size={40} color='white' onPress={() => router.push('/(tabs)/home')} />
                <Text style={styles.headerText}>Tutor Posting</Text>
                <View style={{ width: 40 }}/>
            </View>

            <View style={{ justifyContent: 'flex-start', flexDirection: 'column', paddingTop: 20, paddingHorizontal: 10 }}>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Course Code</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name='search-sharp' size={30} color='#ffc04d' />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10 }} placeholder='Course code'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Location</Text>
                    <View style={styles.searchBar}>
                        <Ionicons name='search-sharp' size={30} color='#ffc04d' />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10 }} placeholder='Physical / Online'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>About the lesson</Text>
                    <View style={styles.searchBar}>
                        <MaterialIcons name='keyboard' size={25} color='orange' />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10, flex: 1 }} placeholder='Brief description about the lesson...'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Availability, eg.(Monday 7-9pm)</Text>
                    <View style={styles.searchBar}>
                        <MaterialIcons name='keyboard' size={25} color='orange' />
                        <TextInput style={{ color: '#888888', fontSize: 17, marginLeft: 10, flex: 1 }} placeholder='Time slots'/>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20    }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Hourly Rate</Text>
                    <View style={styles.searchBar}>
                        <FontAwesome name='dollar' size={25} color='orange' />
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
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 20, justifyContent: 'flex-start' },
    background: {
    position: 'absolute',
    top: -550, 
    left: -150,
    width: 700,
    height: 650,
    borderRadius: 0,
    backgroundColor: '#ffc04d',
    zIndex: -1,
  },
    headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black'
    },
    searchBar: {
        borderRadius: 20, 
        backgroundColor: '#d1d5db', 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingLeft: 8,
    },  
    postButton: {
        marginTop: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'orange'
    },
    buttonText: { marginHorizontal: 4, fontSize: 28, fontWeight: '600', marginBottom: 2, color: 'white' },
})