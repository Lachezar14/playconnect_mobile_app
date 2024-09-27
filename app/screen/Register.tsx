import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebaseConfig';
import {doc, runTransaction} from 'firebase/firestore';
import { AuthStackParamList } from '../utilities/AuthStackParamList';
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {SafeAreaView} from "react-native-safe-area-context";

type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface RegisterProps {
    navigation: SignUpScreenNavigationProp;
}

const Register: React.FC<RegisterProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const signUp = async () => {
        setLoading(true);
        try {
            // Create a new user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            // Run a Firestore transaction to add the user to both collections atomically
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const userRef = doc(FIRESTORE_DB, 'users', user.uid);
                const userStatsRef = doc(FIRESTORE_DB, 'userStats', user.uid);

                // Add user data to the "users" collection
                transaction.set(userRef, {
                    firstName,
                    lastName,
                    email: user.email,
                    userId: user.uid
                });

                // Add initial stats to the "userStats" collection
                transaction.set(userStatsRef, {
                    userId: user.uid,
                    totalEventsJoined: 0,
                    totalEventsCreated: 0,
                    favouriteSport: '',
                    userRating: 3,
                    totalEventsCheckedIn: 0,
                    checkInPercentage: 0,
                });
            });

            // Navigate the user to the main app after sign-up
            navigation.navigate('Inside');
        } catch (error) {
            console.log('Error creating user: ', error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    style={styles.input}
                />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                />
                <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First Name"
                    style={styles.input}
                />
                <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last Name"
                    style={styles.input}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <Button title="Sign Up" onPress={signUp} />
                )}
            </View>
        </SafeAreaView>
    );
};

export default Register;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',  // Centers the form vertically
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        elevation: 3,  // Adds a shadow for Android (optional)
        shadowColor: '#000',  // Adds shadow for iOS (optional)
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
});
