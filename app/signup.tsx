import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Button, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { auth, db } from '../lib/firebase';


export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();  

  const handleSignup = async () => {
    // if (!email.endsWith('@u.nus.edu')) {
    //   Alert.alert('Signup failed Only NUS student emails are allowed.');
    //   return;
    // }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      Alert.alert('Signup failed', 'Please enter your first name.');
      return;
    }

    if (trimmedLastName === '') {
      Alert.alert('Signup failed', 'Please enter your last name.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //send verification email
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: email,
        createdAt: new Date(),
        profilePicture: "https://randomuser.me/api/portraits/lego/5.jpg",
        ratings: null,
        emailVerified: false
      });
      Alert.alert(
        'Success: Account created successfully! Verification email sent.',
        'Please verify your email before logging in.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/'); // Redirect to the login page after signup
            },
          },
        ]
      );
    } catch (error: any) {
      // Handle different error codes during signup
      let errorMessage = 'Unknown error occurred. Please try again.';
      
      if (error.code === 'auth/invalid-email' ) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/missing-password' || error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters long.';
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please use a different email.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many signup attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Signup failed', errorMessage);
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={require('../assets/images/logo.jpg')} style={styles.image} />
        <Text style={styles.title}>Welcome to LearNUS!</Text>
      </View>
      <Text style={styles.headings}>Signing Up</Text>
      <TextInput placeholder="First Name" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last Name" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Create Account" onPress={handleSignup} color={'#000000'} />
       <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
        <Text style={styles.dividerText}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
      </View>
      <Text style={styles.dividerText}>
        Already on LearNUS?{' '}
        <Link href={'/login'} style={styles.link}>
          <Text style={styles.link}>Sign in</Text>
        </Link>
      </Text>
    </ScrollView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding :20 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 20 },
  // innerContainer: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 25, fontWeight: 'bold', marginLeft: 10, marginTop: 50 },
  headings: { fontSize: 28, fontWeight: 'bold', marginTop: 80, marginBottom: 10},
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5, opacity: 0.5 },
  dividerText: { marginHorizontal: 10, color: '#666', textAlign: 'center', },
  link: { color: '#000000', fontWeight: '600', textDecorationLine: 'underline'},
  image: { width: 70, height: 70, borderRadius: 10, alignItems: 'center', marginTop: 50 },
});

