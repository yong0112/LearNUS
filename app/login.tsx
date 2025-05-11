// app/login.tsx
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Logged in successfully!');
      router.replace('/home'); // Or any other protected route
    } catch (error: any) {
      Alert.alert('Login failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.jpg')} style={styles.image} />
      <Text style={styles.title}>Welcome to LearNUS!</Text>
      <Text style={styles.headings}>Sign In</Text>
      <Text style={styles.subheadings}>Login with your school email address</Text>
      <TextInput placeholder="email@domain.com" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Continue" onPress={handleLogin} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        <Text style={styles.dividerText}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
      </View>
      <Text style={styles.dividerText}>
        New to LearNUS?{' '}
        <Text style={styles.signUpLink} onPress={() => navigation.navigate('Signup')}>Join Now</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 80, textAlign: 'center' },
  headings: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subheadings: { fontSize: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5, opacity: 0.5 },
  dividerText: { marginHorizontal: 10, color: '#666', textAlign: 'center', },
  signUpLink: { color: '#2832C2', textDecorationLine: 'underline'},
  image: { width: 150, height: 150, borderRadius: 10, marginBottom: 10, alignSelf: 'center' },
});
