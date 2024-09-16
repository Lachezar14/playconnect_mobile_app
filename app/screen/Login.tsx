import {View, Text, StyleSheet, TextInput, ActivityIndicator, Button, KeyboardAvoidingView} from 'react-native'
import React, { useState } from 'react'
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../utilities/AuthStackParamList'; // Define your navigation types


type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation<LoginScreenNavigationProp>();   // Navigation hook

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Navigate to the SignUp Page
  const navigateToSignUp = () => {
    navigation.navigate('Register');  // Navigating to the registration page
  };


  return (
    <View style={styles.container}>
        <KeyboardAvoidingView behavior='padding'>
      <TextInput value={email} style={styles.input} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
      <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder='Password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>

        {loading ? <ActivityIndicator size='large' color='blue' /> : (
          <>
            <Button title='Sign In' onPress={signIn}></Button>
            <Button title='Sign Up' onPress={navigateToSignUp}></Button>
          </>
        )}
        </KeyboardAvoidingView>
    </View>
  );
}

export default Login;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginHorizontal: 20,
      justifyContent: 'center',
    },
    input: {
      marginVertical: 4,
      height: 50,
      borderWidth: 1,
      padding: 10,
      borderRadius: 4,
      backgroundColor: '#fff',
    },
  });