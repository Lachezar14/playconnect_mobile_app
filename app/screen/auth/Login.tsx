import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../utilities/AuthStackParamList'; // Define your navigation types
import { FontAwesome } from '@expo/vector-icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation<LoginScreenNavigationProp>();

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
  };

  const navigateToSignUp = () => {
    navigation.navigate('Register');
  };

  return (
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <Text style={styles.title}>Welcome to PlayConnect</Text>
          <Text style={styles.subtitle}>
            Organize your life, boost your productivity, and achieve your goals with TaskMaster. Sign in to get started or create a new account.
          </Text>

          <TextInput
              value={email}
              style={styles.input}
              placeholder="Email Address"
              autoCapitalize="none"
              onChangeText={(text) => setEmail(text)}
          />
          <View style={styles.passwordContainer}>
            <TextInput
                secureTextEntry
                value={password}
                style={styles.passwordInput}
                placeholder="Password"
                autoCapitalize="none"
                onChangeText={(text) => setPassword(text)}
            />
            <FontAwesome name="eye-slash" size={24} color="gray" style={styles.eyeIcon} />
          </View>

          {loading ? (
              <ActivityIndicator size="large" color="blue" />
          ) : (
              <TouchableOpacity style={styles.signInButton} onPress={signIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
          )}

          {/*<Text style={styles.orText}>Or continue with</Text>*/}

          {/*<View style={styles.socialButtons}>*/}
          {/*  <TouchableOpacity style={styles.socialButton}>*/}
          {/*    <FontAwesome name="google" size={24} color="black" />*/}
          {/*  </TouchableOpacity>*/}
          {/*  <TouchableOpacity style={styles.socialButton}>*/}
          {/*    <FontAwesome name="apple" size={24} color="black" />*/}
          {/*  </TouchableOpacity>*/}
          {/*  <TouchableOpacity style={styles.socialButton}>*/}
          {/*    <FontAwesome name="facebook" size={24} color="black" />*/}
          {/*  </TouchableOpacity>*/}
          {/*</View>*/}

          <TouchableOpacity onPress={navigateToSignUp}>
            <Text style={styles.registerText}>
              Don’t have an account? <Text style={styles.registerLink}>Register</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  signInButton: {
    backgroundColor: '#38A169',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  registerText: {
    textAlign: 'center',
    color: '#666',
  },
  registerLink: {
    color: '#38A169',
    fontWeight: 'bold',
  },
});
