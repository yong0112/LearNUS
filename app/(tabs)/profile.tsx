import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
export default function Profile() {
  const router = useRouter();
    
  const menuItems = [
    { label: 'Profile Details', route: '/profile/details' },
    { label: 'Tutoring History', route: '/profile/history' },
    { label: 'Ratings & Reviews', route: '/profile/reviews' },
    { label: 'Achievements & Badges', route: '/profile/achievements' },
    { label: 'Payment Methods', route: '/profile/payments' },
    { label: 'Security & Privacy', route: '/profile/security' },
    { label: 'Contact Us', route: '/profile/contact' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <Image
        source={require('../../assets/images/profile.png')}
        style={styles.avatar}
      />

      <Text style={styles.name}>John</Text>

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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'center',
    marginVertical: 10,
  },
  menu: {
    marginTop: 30,
  },
  menuItem: {
    backgroundColor: '#f2f2f2',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
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
