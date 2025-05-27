import { auth, db } from '@/lib/firebase';
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

const screenHeight = Dimensions.get('window').height;

export default function tutoring() {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [tutors, setTutors] = useState<any>([]);
    const [filteredTutors, setFilteredTutors] = useState<any>([]);
    const [selectedTutor, setSelectedTutor] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { location, ratings, minRate, maxRate} = useLocalSearchParams();

    const displayedTutors = filteredTutors.filter((tutor: { id: React.Key | null | undefined; tutorName: string; tutorRating: string; course: string; location: string; description: string; availability: string; rate: number, profilePicture: string }) =>
        tutor.tutorName.toLowerCase().includes(searchText.toLowerCase()) || 
        tutor.course.toLowerCase().includes(searchText.toLowerCase())
    )

    const handleFilter = () => {
        router.push('/tutor_find_filter')
    }

    const handleSort = (option: string) => {
        switch (option) {
            case 'rating-asc':
                sortTutors('rating', 'asc');
                break;
            case 'rating-desc':
                sortTutors('rating', 'desc');
                break;
            case 'rate-asc':
                sortTutors('rate', 'asc');
                break;
            case 'rate-desc':
                sortTutors('rate', 'desc');
                break;
        }
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
          setFilteredTutors(tutorList)
        }
    }

    useEffect(() => {
        fetchData();
    }, [])
    
    useEffect(() => {
        const filtered = tutors.filter((tutor: { id: React.Key | null | undefined; tutorName: string; tutorRating: string; course: string; location: string; description: string; availability: string; rate: number, profilePicture: string }) => {
            const locationValue = location ?? 'Any'; 

            const locationMatch = locationValue === 'Any' 
                ? true 
                : (typeof locationValue === 'string' 
                ? tutor.location.toLowerCase().includes(locationValue.toLowerCase()) 
                : tutor.location.toLowerCase().includes(locationValue[0].toLowerCase()));

            return (
            (locationMatch) &&
            (!ratings || parseFloat(tutor.tutorRating as string) >= Number(parseFloat(ratings as string))) &&
            (!minRate || tutor.rate >= Number(parseInt(minRate as string))) &&
            (!maxRate || tutor.rate <= Number(parseInt(maxRate as string)))
            );
        });
        setFilteredTutors(filtered);
    }, [location, ratings, minRate, maxRate, tutors])

    const sortTutors = (criteria: 'rating' | 'rate', order: 'asc' | 'desc') => {
        const sorted = [...tutors].sort((x: { tutorRating: string; rate: string | number; }, y: { tutorRating: string; rate: string | number; }) => {
            let xValue: number | string;
            let yValue: number | string;

            switch (criteria) {
                case 'rating':
                    xValue = parseFloat(x.tutorRating);
                    yValue = parseFloat(y.tutorRating);
                    break;
                case 'rate':
                    xValue = x.rate;
                    yValue = y.rate;
                    break;
                default:
                    return 0;
            }

            if (xValue < yValue) return order === 'asc' ? -1 : 1;
            if (xValue > yValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
        
        setTutors(sorted);
    };

    const handleTutorProfile = (tutor: { id: React.Key | null | undefined; tutorName: string; tutorRating: string; course: string; location: string; description: string; availability: string; rate: number; profilePicture: string; }) => {
        setSelectedTutor(tutor)
        setModalVisible(true)
    }

    const closeModal = () => {
        setSelectedTutor(null)
        setModalVisible(false)
    }

    const handleBooking = () => {
        console.log("Booking in progress")
    }

    const handleContact = () => {
        console.log("Contact in progress")
    } 

    return (
        <View style={styles.container}>
            {/*Search Bar*/}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name='arrow-back-circle' size={40} color='#ffc04d' onPress={() => router.push('/(tabs)/home')} />
                <View style={styles.searchBar}>
                    <Ionicons name='search-sharp' size={30} color='#ffc04d' />
                    <TextInput 
                    style={{ color: '#888888', fontSize: 17, marginLeft: 5 }} 
                    placeholder='Search by tutors name or course code'
                    value={searchText}
                    onChangeText={setSearchText}/>
                </View>
            </View>

            {/*Filter and Sort*/}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', paddingVertical: 12,  }}>
                <TouchableOpacity style={styles.filterButton} onPress={handleFilter}>
                    <MaterialCommunityIcons name="filter-outline" size={20} color={'black'} />
                    <Text style={styles.buttonText}>Filter</Text>
                </TouchableOpacity>
                
                <Menu onSelect={handleSort}>
                    <MenuTrigger style={styles.filterButton}>
                        <MaterialCommunityIcons name="sort" size={20} color="black" />
                        <Text style={styles.buttonText}>Sort</Text>
                        <FontAwesome name="angle-down" size={20} color="#9ca3af" />
                    </MenuTrigger>
                    <MenuOptions 
                    customStyles={{
                        optionsContainer: {
                            width: 220,
                            borderRadius: 6,
                            backgroundColor: 'white',
                            right: 0,
                        },
                    }}>
                        <MenuOption value='rating-asc' text='Rating (Low to High)' />
                        <MenuOption value='rating-desc' text='Rating (High to Low)' />
                        <MenuOption value='rate-asc' text='Hourly Rate (Cheap to Expensive)' />
                        <MenuOption value='rate-desc' text='Hourly Rate (Expensive to Cheap)' />
                    </MenuOptions>
                </Menu>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {displayedTutors.length === 0 ? (
                <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'center' }}>No tutors yet.</Text>
                ) : (
                    displayedTutors.map((tutor: { id: React.Key | null | undefined; tutorName: string; tutorRating: string; course: string; location: string; description: string; availability: string; rate: number, profilePicture: string }) => (
                        <TouchableOpacity key={tutor.id} style={styles.tutorCard} onPress={() => handleTutorProfile(tutor)}>
                            <Image source={{ uri: tutor.profilePicture }} style={styles.image} />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 24, fontWeight: '800' }}>{tutor.tutorName}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <AntDesign name='star' size={20} color={'yellow'} />
                                    <Text style={{ fontSize: 24, fontWeight: '800' }}>{tutor.tutorRating}</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#888888' }}>{tutor.course} - {tutor.description}</Text>
                            <Text style={{ fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: '#444444' }}>S${tutor.rate} per hour</Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <Modal
                animationType="slide"
                transparent
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedTutor && (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', alignSelf: 'stretch', marginBottom: 30 }}>
                                <View>
                                    <TouchableOpacity onPress={closeModal}>
                                        <AntDesign name='arrowleft' size={30} color={'orange'} />
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity>
                                        <FontAwesome name='share' size={30} color={'orange'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Image source={{ uri: selectedTutor.profilePicture }} style={styles.modalImage} />
                            <Text style={{ fontSize: 28, fontWeight: '600', alignSelf: 'center' }}>{selectedTutor.tutorName}</Text>
                            <Text style={{ fontSize: 24, fontWeight: '600', marginTop: 25 }}>{selectedTutor.course}</Text>
                            <Text style={{ fontSize: 18, color: '#888888', marginTop: 10 }}>{selectedTutor.description}</Text>
                            <Text style={{ fontSize: 22, fontWeight: '600', marginTop: 15 }}>Availability</Text>
                            <Text style={{ fontSize: 18, color: '#888888', marginTop: 5 }}>{selectedTutor.availability}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20, alignItems: 'center' }}>
                                <View style={{ backgroundColor: 'lightgray', justifyContent: 'center', alignItems: 'center', width: 50, height: 50 }}>
                                    <AntDesign name='star' size={30} color={'yellow'} />
                                </View>
                                <Text style={{ fontSize: 20, color: 'gray', marginHorizontal: 10 }}>{selectedTutor.tutorRating}/5.0 stars</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20, alignItems: 'center' }}>
                                <View style={{ backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', width: 50, height: 50 }}>
                                    <FontAwesome name='dollar' size={30} color={'black'} />
                                </View>
                                <Text style={{ fontSize: 20, color: 'gray', marginHorizontal: 10 }}>{selectedTutor.rate} per hour</Text>
                            </View>
                            <TouchableOpacity style={{ marginTop: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'orange', alignSelf: 'stretch' }} onPress={handleBooking}>
                                <Text style={{ marginHorizontal: 4, fontSize: 28, fontWeight: '600', marginBottom: 2, color: 'white' }}>Book now!</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ marginTop: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', alignSelf: 'stretch', flexDirection: 'row', borderWidth: 3 }} onPress={handleContact}>
                                <Entypo name='old-phone' size={25} color={'black'} />
                                <Text style={{ marginHorizontal: 4, fontSize: 28, fontWeight: '600', marginBottom: 2, color: 'black' }}>Contact me!</Text>
                            </TouchableOpacity>
                        </>
                        )}
                    </View>
                </View>
            </Modal>
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
    filterSelectedButton: {
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 6,
        backgroundColor: 'orange'
    },
    buttonText: { marginHorizontal: 4, fontSize: 14, fontWeight: '400', marginBottom: 2 },
    buttonSelectedText: { marginHorizontal: 4, fontSize: 14, fontWeight: '400', marginBottom: 2, color: 'white' },
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
    },
    modalOverlay: {
        padding: 20,
        alignItems: 'center',
        flex: 1
    },
    modalContent: {
        width: '97%',
        height: screenHeight * 0.95,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        alignItems: 'flex-start',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.8,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        alignSelf: 'center'
    },
    modalImage: {
        width: 120,
        height: 120,
        borderRadius: 50,
        alignSelf: 'center'
    },
})