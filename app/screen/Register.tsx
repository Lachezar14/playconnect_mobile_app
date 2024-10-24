import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
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
            navigation.navigate('Onboarding', { firstName, lastName, email, password });
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
