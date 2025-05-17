import { AntDesign, FontAwesome5, Ionicons, MaterialIcons, Octicons, SimpleLineIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.image} />
        <Text style={styles.headerLear}>Lear</Text><Text style={styles.headerNUS}>NUS</Text>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center' }} onPress={() => router.push('/+not-found')}>
            <Ionicons name="settings" size={30} color="black" />
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.tutorProfile} onPress={() => router.push('/+not-found')}>
            <Image source={require('../../assets/images/person.jpg')} style={{ width: 80, height: 100 }} />
            <Text style={styles.exploreButtonText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tutorProfile} onPress={() => router.push('/+not-found')}>
            <Image source={require('../../assets/images/person.jpg')} style={{ width: 80, height: 100 }} />
            <Text style={styles.exploreButtonText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tutorProfile} onPress={() => router.push('/+not-found')}>
            <Image source={require('../../assets/images/person.jpg')} style={{ width: 80, height: 100 }} />
            <Text style={styles.exploreButtonText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tutorProfile} onPress={() => router.push('/+not-found')}>
            <Image source={require('../../assets/images/person.jpg')} style={{ width: 80, height: 100 }} />
            <Text style={styles.exploreButtonText}>Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tutorProfile} onPress={() => router.push('/+not-found')}>
            <Image source={require('../../assets/images/person.jpg')} style={{ width: 80, height: 100 }} />
            <Text style={styles.exploreButtonText}>Name</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
    height: 150,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ddd',
    backgroundColor: 'grey',
    marginRight: 10,
  },
  image: { width: 50, height: 50, borderRadius: 10 },
});