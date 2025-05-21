import { auth, db } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function history() {
  const router = useRouter();
  const [classes, setClasses] = useState<any>([]);
  
  const fetchData = async () => {
    const user = auth.currentUser?.uid;
    if (user !== undefined) {
      const classRef = collection(db, "users", user, "classes");
      const classSnap = await getDocs(classRef);

      const classList = await Promise.all(
        classSnap.docs.map(async (docSnap) => {
          const classInfo = docSnap.data();
          const classId = docSnap.id;
          const personUid = classInfo.people;

          let profilePictureUrl = '';
          if (personUid) {
            const userDocRef = doc(db, 'users', personUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              profilePictureUrl = userDocSnap.data().profilePicture || '';
            }
          }

          return {
            id: classId,
            role: classInfo.role,
            course: classInfo.course,
            people: personUid,
            startTime: classInfo.startTime,
            profilePicture: profilePictureUrl,
          };
        })
      );

      setClasses(classList)
    }
  }

  useEffect(() => {
    fetchData();
  }, [])
  

  const handleTutorProfile = () => {
    console.log("Press me")
  }

  return (
    <View style={styles.container}>
      {/*Header*/}
      <View style={styles.background} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20   }}>
        <Ionicons name='arrow-back-circle' size={40} color='white' onPress={() => router.push('/(tabs)/profile')} />
        <Text style={styles.headerText}>Tutoring History</Text>
        <View style={{ width: 40 }}/>
      </View>

      {/*List*/}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      {classes.length === 0 ? (
        <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'center' }}>No classes yet.</Text>
      ) : (
        classes.map((cls: { id: React.Key | null | undefined; course: string; role: string; startTime: string; profilePicture: string }) => (
          <TouchableOpacity key={cls.id} style={styles.classCard} onPress={handleTutorProfile}>
            <View style={{ flexDirection: 'column', justifyContent: 'space-evenly' }}>
              <Text style={styles.subject}>{cls.course} ({cls.role})</Text>
              <Text style={{ fontSize: 18 }}>{cls.startTime}</Text>
            </View> 
            <Image source={{ uri: cls.profilePicture }} style={styles.avatar} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical : 40, paddingHorizontal: 20 },
  background: {
      position: 'absolute',
      top: -550, 
      left: -350,
      width: 100000,
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
  classCard: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  subject: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 20
  },
})