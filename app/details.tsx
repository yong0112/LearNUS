import { auth, db } from '@/lib/firebase';
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Details() {
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

  const handleChangeEmail = () => {
    console.log("Change email....")
  }

  const handleChangeProfilePic = () => {
    console.log("Change profile pic")
  }

  return (
    <View style={styles.container}>
      {/*Header*/}
      <View style={styles.background} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Ionicons name='arrow-back-circle' size={40} color='white' onPress={() => router.push('/(tabs)/profile')} />
        <Text style={styles.headerText}>Personal Details</Text>
        <View style={{ width: 40 }}/>
      </View>

      {/*Avatar*/}
      <View style={{ paddingVertical: 20, marginBottom: 40 }}>
        <Image source={require('../assets/images/defaultProfile.jpg')} style={styles.avatar} />
        <TouchableOpacity style={{ alignSelf: 'center', marginLeft: 100 }} onPress={handleChangeProfilePic}>
          <MaterialCommunityIcons name='progress-pencil' size={30}/>
        </TouchableOpacity>
      </View>

      {/*Info List*/}
      <View style={styles.info}>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.field}>{userProfile?.firstName}</Text>
        </View>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.field}>{userProfile?.lastName}</Text>
        </View>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.field}>Unknown</Text>
        </View>
        <View style={{ paddingBottom: 35 }}>
          <Text style={styles.label}>Email</Text>
          <TouchableOpacity style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', borderBottomColor: '#aaaaaa', borderBottomWidth: 2 }}onPress={handleChangeEmail}>
            <Text style={{ fontSize: 16, marginHorizontal: 5, color: '#666666' }}>{userProfile?.email}</Text>
            <Octicons name='pencil' size={15} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical : 40, paddingHorizontal: 20 },
  background: {
        position: 'absolute',
        top: -550, 
        left: -150,
        width: 10000,
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 20
  },
  info: { marginHorizontal: 20 },
  label: { fontSize: 24, fontWeight: 500, marginBottom: 10 },
  field: { fontSize: 16, marginHorizontal: 8, color: '#666666', borderBottomColor: '#aaaaaa', borderBottomWidth: 2 }
})