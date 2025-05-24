import { auth, db } from '@/lib/firebase';
import { AntDesign, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function tutoring() {
    const router = useRouter();
    const [tutors, setTutors] = useState<any>([]);

    const handleFilter = () => {
        console.log("Filtering");
    }

    const handleSort = () => {
        console.log("Sorting");
    }

    const fetchData = async () => {
        const user = auth.currentUser?.uid;
        if (user !== undefined) {
          const tutorRef = collection(db, "tutors");
          const tutorSnap = await getDocs(tutorRef);
    
          const tutorList = await Promise.all(
            tutorSnap.docs.map(async (docSnap) => {
              const tutorInfo = docSnap.data();
              const postingId = docSnap.id;
              const tutorUid = tutorInfo.tutor;
    
              let profilePictureUrl = '';
              let tutorName = '';
              let tutorRating = 0;
              if (tutorUid) {
                const userDocRef = doc(db, 'users', tutorUid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  profilePictureUrl = userDocSnap.data().profilePicture || '';
                  tutorName = userDocSnap.data().firstName || '';
                  tutorRating = userDocSnap.data().ratings || 0;
                }
              }
    
              return {
                id: postingId,
                tutor: tutorInfo.tutor,
                tutorName: tutorName,
                tutorRating: tutorRating,
                course: tutorInfo.course,
                location: tutorInfo.location,
                description: tutorInfo.description,
                availability: tutorInfo.availability,
                rate: tutorInfo.rate,
                profilePicture: profilePictureUrl,
              };
            })
          );
    
          setTutors(tutorList)
        }
    }
    
    useEffect(() => {
        fetchData();
    }, [])

    const handleTutorProfile = () => {
        console.log("Tutor profile")
    }

    return (
        <View style={styles.container}>
            {/*Header*/}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name='arrow-back-circle' size={40} color='#ffc04d' onPress={() => router.push('/(tabs)/home')} />
                <View style={styles.searchBar}>
                    <Ionicons name='search-sharp' size={30} color='#ffc04d' />
                    <TextInput style={{ flex: 1, color: '#888888', fontSize: 17, marginLeft: 10 }} placeholder='Search'/>
                </View>
            </View>

            {/*Search*/}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 12,  }}>
                <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
                    <MaterialCommunityIcons name="filter-outline" size={20} color="black" />
                    <Text style={styles.buttonText}>Filter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton} onPress={handleSort}>
                    <MaterialCommunityIcons name="sort" size={20} color="black" />
                    <Text style={styles.buttonText}>Sort</Text>
                    <FontAwesome name="angle-down" size={20} color="#9ca3af" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {tutors.length === 0 ? (
                <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'center' }}>No tutors yet.</Text>
                ) : (
                    tutors.map((tutor: { id: React.Key | null | undefined; tutorName: string; tutorRating: string; course: string; location: string; description: string; availability: string; rate: number, profilePicture: string }) => (
                        <TouchableOpacity key={tutor.id} style={styles.tutorCard} onPress={handleTutorProfile}>
                            <Image source={{ uri: tutor.profilePicture }} style={styles.image} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 24, fontWeight: '800' }}>{tutor.tutorName}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <AntDesign name='star' size={20} color={'black'} />
                                    <Text style={{ fontSize: 24, fontWeight: '800' }}>{tutor.tutorRating}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '600' }}>{tutor.course} - {tutor.description}</Text>
                            <Text style={{ fontSize: 20, fontWeight: '700', fontStyle: 'italic' }}>S${tutor.rate} per hour</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 40, paddingHorizontal: 10, justifyContent: 'flex-start' },
    searchBar: { 
        flex: 1, 
        paddingHorizontal: 10, 
        borderRadius: 20, 
        backgroundColor: '#d1d5db', 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginLeft: 8,
    },  
    filterButton: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 6
    },
    buttonText: { marginHorizontal: 4, fontSize: 14, fontWeight: '400', marginBottom: 2 },
    tutorCard: {
        marginBottom: 20,
        flexDirection: 'column',
        borderBottomWidth: 2,
        borderBottomColor: 'gray'
    },
    image: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: 10,
        paddingHorizontal: 5, 
        borderBottomWidth: 2,
        borderBottomColor: '#444444',
        height: 150
    }
})