import { AntDesign, Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Rating } from 'react-native-ratings';
import { auth, db } from '../../lib/firebase';

export default function ratings() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any | undefined>(null);
  const [reviews, setReviews] = useState<any | undefined>(null);
  
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

  const fetchReviews = async () => {
    const user = auth.currentUser?.uid;
    if (user !== undefined) { 
      const reviewRef = collection(db, "users", user, "reviews");
      const reviewSnap = await getDocs(reviewRef);

      const reviewList = await Promise.all(
        reviewSnap.docs.map(async (docSnap) => {
          const reviewInfo = docSnap.data();
          const reviewId = docSnap.id;
          const personUid = reviewInfo.people;

          let profilePictureUrl = '';
          let name = '';
          if (personUid) {
            const userDocRef = doc(db, 'users', personUid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              profilePictureUrl = userDocSnap.data().profilePicture || '';
              name = userDocSnap.data().firstName +  userDocSnap.data().lastName || '';
            }
          }

          return {
            id: reviewId,
            comment: reviewInfo.comment,
            date: reviewInfo.date.toDate(),
            name: name,
            rating: reviewInfo.rating,
            profilePicture: profilePictureUrl,
          };
        })
      );

      setReviews(reviewList)
    }
  }

  useEffect(() => {
    Promise.all([fetchData(), fetchReviews()])
      .then(() => console.log("Done"))
      .catch((error) => console.error('Error fetching data: ', error))
  }, [])

  return (
    <View style={styles.container}>
      {/*Header*/}
      <View style={styles.background} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Ionicons name='arrow-back-circle' size={40} color='white' onPress={() => router.push('/(tabs)/profile')} />
        <Text style={styles.headerText}>Ratings & Reviews</Text>
        <View style={{ width: 40 }}/>
      </View>

      <View style={{ paddingVertical: 10, flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 60, fontWeight: '800', marginBottom: 8 }}>{userProfile?.ratings}</Text>
        <Rating
          type="star"
          startingValue={userProfile?.ratings}
          readonly
          imageSize={40}
          ratingColor="#FFD700"
          ratingBackgroundColor="#dcdcdc"
          fractions={10} />
        <Text style={{ fontSize: 15, fontWeight: '400', color: 'darkgray', marginTop: 8 }}>{reviews?.length || 0} reviews</Text>
      </View>

      <View>
      {!reviews ? (
        <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'center' }}>Loading reviews...</Text>
      ) : reviews.length === 0 ? (
        <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'center' }}>No reviews yet.</Text>
      ) : (
        reviews.map((review: { id: React.Key | null | undefined; rating: number; date: Date; comment: string; name: string; profilePicture: string }) => (
          <View key={review.id} style={{ borderBottomWidth: 2, borderBottomColor: 'darkgray' }}>
            <View style={styles.review}>
              <Image source={{ uri: review.profilePicture }} style={styles.avatar} />
              <Text style={{ fontSize: 18, fontWeight: '500', alignSelf: 'center' }}>{review.name}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500', alignSelf: 'center', color: 'darkgray', marginRight: 20 }}> • {format(review.date, 'd MMM yyyy')} •</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', alignSelf: 'center' }}>{review.rating}</Text>
                <AntDesign name='star' size={25} color={'orange'} />
              </View>
            </View>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>{review.comment}</Text>
          </View>
        ))
      )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingVertical : 40, paddingHorizontal: 20 },
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
  review: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
    alignSelf: 'center',
    marginRight: 15
  },
})