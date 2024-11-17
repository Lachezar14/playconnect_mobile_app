import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Register = ({ navigation } : any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            navigation.navigate('Onboarding', { firstName, lastName, email, password });
        } catch (error) {
            console.log('Error creating user: ', error);
        } finally {
            setLoading(false);
        }
    };

    const navigateToSignIn = () => {
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior="padding">
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                    Join PlayConnect to discover and participate in sports activities near you
                </Text>

                <TextInput
                    value={firstName}
                    style={styles.input}
                    placeholder="First Name"
                    onChangeText={(text) => setFirstName(text)}
                />

                <TextInput
                    value={lastName}
                    style={styles.input}
                    placeholder="Last Name"
                    onChangeText={(text) => setLastName(text)}
                />

                <TextInput
                    value={email}
                    style={styles.input}
                    placeholder="Email Address"
                    autoCapitalize="none"
                    keyboardType="email-address"
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
                    <ActivityIndicator size="large" color="#38A169" />
                ) : (
                    <TouchableOpacity style={styles.signInButton} onPress={handleRegister}>
                        <Text style={styles.signInButtonText}>Create Account</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={navigateToSignIn}>
                    <Text style={styles.registerText}>
                        Already have an account? <Text style={styles.registerLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
};

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

export default Register;