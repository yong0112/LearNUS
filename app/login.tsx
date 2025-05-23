// app/login.js
import { useNavigation } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Button, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { db, auth } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the email is verified 
      if (!user.emailVerified) {
        Alert.alert('Login failed', 'Please verify your email before logging in.',
          [
            {
              text: 'Send Again',
              onPress: async () => {
                await sendEmailVerification(user);
                Alert.alert('Verification email sent. Please check your inbox.');
              }
            }
          ]
        );
        return;
      }

      // Update firestore doc
      await updateDoc(doc(db, 'users', user.uid), {
        emailVerified: true,
      });

      // Alert for successful login and redirect to home page
      Alert.alert('Success: Logged in successfully!');
      router.replace('/(tabs)/home'); 

    } catch (error: any) {
      Alert.alert('Login failed: ' + error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior= {Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset= {Platform.OS === 'ios' ? 0 : 20} 
      enabled
    >
    <View style={styles.innerContainer}>
      <Image source={require('../assets/images/logo.jpg')} style={styles.image} />
      <Text style={styles.title}>Welcome to LearNUS!</Text>
      <Text style={styles.headings}>Sign In</Text>
      <Text style={styles.subheadings}>Login with your personal email address</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Continue" onPress={handleLogin} color={'#000000'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        <Text style={styles.dividerText}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
      </View>
      <Text style={styles.dividerText}>
        New to LearNUS?{' '}
        <Link href={'/signup'} style={styles.signUpLink}>
          <Text style={styles.signUpLink}>Join Now</Text>
        </Link>
      </Text>
    </View>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  innerContainer: { flex: 1, justifyContent: 'center' }, // Added style for innerContainer
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 50, textAlign: 'center' },
  headings: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subheadings: { fontSize: 15, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5, opacity: 0.5 },
  dividerText: { marginHorizontal: 10, color: '#666', textAlign: 'center', },
  signUpLink: { color: '#000000', fontWeight: '600', textDecorationLine: 'underline'},
  image: { width: 120, height: 120, borderRadius: 10, marginBottom: 10, marginTop: 100, alignSelf: 'center' },
});