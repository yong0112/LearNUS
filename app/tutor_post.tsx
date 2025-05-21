import { auth, db } from '@/lib/firebase';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export default function TutorPost() {
    const router = useRouter();
    const [course, setCourse] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [availability, setAvailability] = useState('');
    const [rate, setRate] = useState<number>();

    const courseCode = [
        { label: 'CS1101S', value: 'CS1101S' },
        { label: 'CS1231S', value: 'CS1231S' },
        { label: 'CS2030S', value: 'CS2030S' },
        { label: 'CS2040S', value: 'CS2040S' },
        { label: 'MA1521', value: 'MA1521' },
        { label: 'MA1522', value: 'MA1522' },
        { label: 'ST2334', value: 'ST2334' },
        { label: 'GEC1015', value: 'GEC1015' },
    ];

    const locationOption = [
        { label: 'Physical', value: 'Physical' },
        { label: 'Online', value: 'Online' },
    ]


    const handlePosting = async () => {
        try {
            const user = auth.currentUser;
            await addDoc(collection(db, 'tutors'), {
                tutor: user?.uid,
                course: course,
                location: location,
                description: description,
                availability: availability,
                rate: rate
            });
            Alert.alert('Tutor post created successfully!');
            router.replace('/(tabs)/home');
        } catch (error: any) {
            console.error("Error: ", error);
            Alert.alert('Posting failed' + error.message);
        }
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
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={courseCode}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={"Course code"}
                            value={course}
                            onChange={item => {
                                setCourse(item.value);
                            }}
                            renderLeftIcon={() => (
                            <Ionicons
                                color={"#ffc04d"}
                                name="search-sharp"
                                size={30}
                            />
                            )}
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Location</Text>
                    <View style={styles.searchBar}>
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={locationOption}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder={"Physical / Online"}
                            value={location}
                            onChange={item => {
                                setLocation(item.value);
                            }}
                            renderLeftIcon={() => (
                            <Ionicons
                                color={"#ffc04d"}
                                name="search-sharp"
                                size={30}
                            />
                            )}
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>About the lesson</Text>
                    <View style={styles.searchBar}>
                        <MaterialIcons name='keyboard' size={25} color='orange' />
                        <TextInput 
                        style={{ color: '#222222', fontSize: 17, marginLeft: 10, flex: 1 }} 
                        placeholder='Brief description about the lesson...' 
                        placeholderTextColor="#888888"
                        onChangeText={setDescription} 
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Availability, eg.(Monday 7-9pm)</Text>
                    <View style={styles.searchBar}>
                        <MaterialIcons name='keyboard' size={25} color='orange' />
                        <TextInput 
                        style={{ color: '#222222', fontSize: 17, marginLeft: 10, flex: 1 }} 
                        placeholder='Time slots' 
                        placeholderTextColor="#888888"
                        onChangeText={setAvailability} 
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 5, paddingVertical: 20    }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 5 }}>Hourly Rate</Text>
                    <View style={styles.searchBar}>
                        <FontAwesome name='dollar' size={25} color='orange' />
                        <TextInput 
                        style={{ color: '#222222', fontSize: 17, marginLeft: 10 }} 
                        keyboardType='numeric' 
                        placeholder='Singapore dollar' 
                        placeholderTextColor="#888888" 
                        onChangeText={(text) => {
                            const num = parseFloat(text);
                            setRate(isNaN(num) ? undefined : num);
                        }}
                        />
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
    label: {
        position: 'absolute',
        backgroundColor: '#f5f5f5',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    dropdown: {
      height: 50,
      flex: 1,
      paddingRight: 8
    },
    placeholderStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: '#888888'
    },
    selectedTextStyle: {
      fontSize: 17,
      marginLeft: 10,
      color: '#222222'
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