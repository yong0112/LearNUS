import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    
  const menuItems = [
    { label: 'Personal Details', route: '../details' },
    { label: 'Tutoring History', route: '/profile/history' },
    { label: 'Ratings & Reviews', route: '/profile/reviews' },
    { label: 'Achievements & Badges', route: '/profile/achievements' },
    { label: 'Payment Methods', route: '/profile/payments' },
    { label: 'Security & Privacy', route: '/profile/security' },
    { label: 'Contact Us', route: '/profile/contact' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.circleBackground}/>

      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <View>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <View style={{ width: 60 }}>
          <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', marginHorizontal: 10 }} onPress={() => router.push('/+not-found')}>
            <Ionicons name="settings" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Image
        source={require('../../assets/images/profile.png')}
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
