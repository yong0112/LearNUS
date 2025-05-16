import { AntDesign, FontAwesome5, Ionicons, MaterialIcons, Octicons, SimpleLineIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

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
          <FontAwesome5 name="chalkboard-teacher" size={30} color="black" />
          <Text style={styles.exploreButtonText}>Tutoring</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/+not-found')}>
          <Image source={require('../../assets/images/nusmods.png')} style={{ width: 50, height: 35 }} />
          <Text style={styles.exploreButtonText}>NUSMods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/+not-found')}>
          <MaterialIcons name="wallet" size={35} color="black" />
          <Text style={styles.exploreButtonText}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/+not-found')}>
          <SimpleLineIcons name="badge" size={30} color="black" />
          <Text style={styles.exploreButtonText}>Badges</Text>
        </TouchableOpacity>
      </ScrollView>

      <Text style={styles.explore}>
        Looking for tutor?
        <TouchableOpacity style={{ marginLeft: 6 }} onPress={() => router.push('/tutor_find')}>
            <AntDesign name={'rightcircle'} size={20} color={'black'} />
        </TouchableOpacity>
      </Text>

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
  container: { padding: 20, justifyContent: 'flex-start' },
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
  reminder: { width: 350, height: 150, borderRadius: 10, backgroundColor: '#aaaaaa', justifyContent: 'center', alignItems:'center' },
  reminderText: { fontSize: 20, fontWeight: 'bold', color: 'black' },
  explore: { fontSize: 20, fontWeight: 'bold', paddingTop: 10, marginRight: 10 },
  exploreButton: {
    width: 80,
    height: 75,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ddd',
    marginRight: 20,
  },
  exploreButtonText : { marginTop: 10, fontSize: 14, fontWeight: 'semibold', textAlign: 'center' },
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