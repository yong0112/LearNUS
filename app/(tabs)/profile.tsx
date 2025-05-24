import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut } from '@firebase/auth';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
import { auth, db } from '../../lib/firebase';

export default function Profile() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | undefined>(null);

  const fetchData = async () => {
    const user = auth.currentUser?.uid;
    if (user !== undefined) {
      const docRef = doc(db, "users", user);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Document data: ", docSnap.data())
        setUserProfile(docSnap.data())
      } else {
        console.log("No such document found!")
      }
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  const handleSettings = (value: string) => {
    switch (value) {
      case 'about':
        Alert.alert("Welcome to LearNUS. That's it!")
        break;
      case 'help':
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
    
  const menuItems = [
    { label: 'Personal Details', route: '../profile/details' },
    { label: 'Tutoring History', route: '../profile/history' },
    { label: 'Ratings & Reviews', route: '../profile/ratings' },
    { label: 'Achievements & Badges', route: '../profile/achievements' },
    { label: 'Payment Methods', route: '../profile/payments' },
    { label: 'Security & Privacy', route: '../profile/security' },
    { label: 'Contact Us', route: '../profile/contact' },
  ];

  return (
    <MenuProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.circleBackground}/>

        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <View>
            <Text style={styles.headerText}>Profile</Text>
          </View>
          <View style={{ width: 60, alignItems: 'flex-end', paddingRight: 10 }}>
            <Menu onSelect={handleSettings}>
              <MenuTrigger>
                <Ionicons name="settings" size={30} color="white" />
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

        <Image
          source={{ uri: userProfile?.profilePicture }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{userProfile?.firstName}</Text>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push(item.route as any)}
              >
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>

              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
  },
  circleBackground: {
    position: 'absolute',
    top: -450, 
    left: -150,
    width: 700,
    height: 650,
    borderRadius: 300,
    backgroundColor: '#FF8C00', // dark orange
    zIndex: -1,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingBottom: 10,
    flex: 1,
    paddingTop: 10
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 20
  },
  name: {
    fontSize: 30,
    fontWeight: '600',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 10
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 20,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  divider: {
  height: 1,
  backgroundColor: '#ccc',
  marginVertical: 5,
}
});
