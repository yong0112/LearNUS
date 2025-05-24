import { auth, db } from '@/lib/firebase';
import { AntDesign, FontAwesome5, Ionicons, MaterialIcons, Octicons, SimpleLineIcons } from '@expo/vector-icons';
import { getAuth, signOut } from '@firebase/auth';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';

export default function Home() {
  const router = useRouter();
  const [tutors, setTutors] = useState<any>([]);

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

  const handleSettings = (value: string) => {
    switch (value) {
      case 'about':
        Alert.alert("Welcome to LearNUS. That's it!")
        break;
      case 'help':
        // Go to payment methods page
        router.push('../profile/contact')
        break;
      case 'logout':
        logoutUser();
        break;
      default:
        console.warn('Unknown menu option:', value);
    }
  }

  const logoutUser = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        router.replace('/login')
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../../assets/images/logo.jpg')} style={styles.image} />
          <Text style={styles.headerLear}>Lear</Text><Text style={styles.headerNUS}>NUS</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Menu onSelect={handleSettings}>
                <MenuTrigger>
                  <Ionicons name="settings-outline" size={30} color="black" />
                </MenuTrigger>
                <MenuOptions customStyles={{
                  optionsContainer: {
                    padding: 10,
                    borderRadius: 6,
                    backgroundColor: 'white',
                    right: 0
                  },
                }}>
                  <MenuOption value="about" text="About" />
                  <MenuOption value="help" text="Help / Support" />
                  <MenuOption value="logout" text="Logout" />
                </MenuOptions>
              </Menu>
          </View>
        </View>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}>
          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/+not-found')}>
            <Ionicons name="heart-outline" size={15} color="black" />
            <Text style={styles.buttonText}>Favourites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/+not-found')}>
            <Ionicons name="list" size={15} color="black" />
            <Text style={styles.buttonText}>Classes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/+not-found')}>
            <Octicons name="history" size={15} color="black" />
            <Text style={styles.buttonText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => router.push('/+not-found')}>
            <MaterialIcons name="stars" size={15} color="black" />
            <Text style={styles.buttonText}>Ratings</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.reminder}>
          <Text style={styles.reminderText}>Currently no classes now...</Text>
        </View>

        <Text style={styles.explore}>Explore</Text>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/tutor_post')}>
            <FontAwesome5 name="chalkboard-teacher" size={40} color="black" />
            <Text style={styles.exploreButtonText}>Tutoring</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/+not-found')}>
            <Image source={require('../../assets/images/nusmods.png')} style={{ width: 50, height: 45 }} />
            <Text style={styles.exploreButtonText}>NUSMods</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/+not-found')}>
            <MaterialIcons name="wallet" size={45} color="black" />
            <Text style={styles.exploreButtonText}>Wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/+not-found')}>
            <SimpleLineIcons name="badge" size={40} color="black" />
            <Text style={styles.exploreButtonText}>Badges</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity style={{ flexDirection: 'row', height: 40, alignItems: 'center' }} onPress={() => router.push('/tutor_find')}>
            <Text style={styles.explore}>Looking for tutor?</Text>
            <AntDesign name={'rightcircle'} size={20} color={'black'} />
        </TouchableOpacity>

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}>
          {tutors.length === 0 ? (
            <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'center' }}>No tutors yet.</Text>
          ) : (
              tutors.map((tutor: { id: React.Key | null | undefined; tutorName: string; tutorRating: string; course: string; rate: number, profilePicture: string }) => (
                  <TouchableOpacity key={tutor.id} style={styles.tutorProfile} onPress={handleTutorProfile}>
                      <Image source={{ uri: tutor.profilePicture }} style={{ width: 80, height: 100, alignSelf: 'center' }} />
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{tutor.course}</Text>
                      <Text style={{ fontSize: 16, fontWeight: '500', fontStyle: 'italic' }}>S${tutor.rate} hourly</Text>
                  </TouchableOpacity>
              ))
          )}
        </ScrollView>
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 40, justifyContent: 'flex-start', flexDirection: 'column' },
  headerLear: { fontSize: 25, fontWeight: 'bold', marginLeft: 10 },
  headerNUS: { fontSize: 25, fontWeight: 'bold', color: 'orange' },
  tabBar: {
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  buttonText: { marginLeft: 6, fontSize: 14, fontWeight: 'semibold' },
  reminder: { width: 'auto', height: 150, borderRadius: 10, backgroundColor: '#aaaaaa', justifyContent: 'center', alignItems:'center', marginBottom: 30 },
  reminderText: { fontSize: 20, fontWeight: 'bold', color: 'black' },
  explore: { fontSize: 24, fontWeight: 'bold', marginRight: 10 },
  exploreButton: {
    width: 90,
    height: 75,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderColor: '#ddd',
    marginRight: 20,
  },
  exploreButtonText : { marginTop: 10, fontSize: 16, fontWeight: 'semibold', textAlign: 'center' },
  tutorProfile: {
    width: 100,
    height: 'auto',
    flexDirection: 'column',
    marginRight: 10,
  },
  image: { width: 50, height: 50, borderRadius: 10 },
});