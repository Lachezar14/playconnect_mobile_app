import React, { useState } from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {MaterialIcons} from "@expo/vector-icons";
import {createUserWithEmailAndPassword} from "firebase/auth";
import {FIREBASE_AUTH, FIRESTORE_DB} from "../../firebaseConfig";
import {doc, runTransaction} from "firebase/firestore";

const sports = ['Football', 'Tennis', 'Basketball', 'Running'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];

const Onboarding = ({ route, navigation }) => {
    const [step, setStep] = useState(0);  // Track the current step
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const { password, email, firstName, lastName } = route.params;
    console.log('Email:', email, 'First Name:', firstName, 'Last Name:', lastName);

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // After the last step, save the preferences to Firestore and navigate to the main app
            savePreferences();
            navigation.navigate('Main');  // Navigate to the main app
        }
    };

    const savePreferences = async () => {
        try {
            // Create a new user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            // Run a Firestore transaction to add the user to both collections atomically
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const userRef = doc(FIRESTORE_DB, 'users', user.uid);
                //const userStatsRef = doc(FIRESTORE_DB, 'userStats', user.uid);

                // Add user data to the "users" collection
                transaction.set(userRef, {
                    firstName,
                    lastName,
                    email: user.email,
                    userId: user.uid,
                    favouriteSport: selectedSport,
                    availability: selectedDays,
                    skillLevel: selectedSkill,
                    userRating: 3,
                    isAvailable: true,
                });

                // Add initial stats to the "userStats" collection
                // transaction.set(userStatsRef, {
                //     userId: user.uid,
                //     totalEventsJoined: 0,
                //     totalEventsCreated: 0,
                //     favouriteSport: '',
                //     userRating: 3,
                //     totalEventsCheckedIn: 0,
                //     checkInPercentage: 0,
                // });
            });
            // navigation.navigate('MainTabNavigator', { screen: 'QuickJoinTab' });
        } catch (error) {
            console.log('Error creating user: ', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {step === 0 && (
                <View style={styles.section}>
                    {sports.map((sport) => (
                        <View key={sport} style={styles.radioButtonRow}>
                            <Text style={styles.sportName}>{sport}</Text>
                            <TouchableOpacity
                                onPress={() => setSelectedSport(sport)}
                                style={styles.radioButton}
                            >
                                {selectedSport === sport ? (
                                    <MaterialIcons name="radio-button-checked" size={24} color="#38A169" />
                                ) : (
                                    <MaterialIcons name="radio-button-unchecked" size={24} color="#767577" />
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {step === 1 && (
                <View>
                    <Text style={styles.title}>Which days are you available?</Text>
                    {daysOfWeek.map((day) => (
                        <Button
                            key={day}
                            title={selectedDays.includes(day) ? `${day} (Selected)` : day}
                            onPress={() => {
                                if (selectedDays.includes(day)) {
                                    setSelectedDays(selectedDays.filter(d => d !== day));
                                } else {
                                    setSelectedDays([...selectedDays, day]);
                                }
                            }}
                        />
                    ))}
                </View>
            )}

            {step === 2 && (
                <View>
                    <Text style={styles.title}>What's your skill level?</Text>
                    <View style={styles.section}>
                        {skillLevels.map((skill) => (
                            <View key={skill} style={styles.radioButtonRow}>
                                <Text style={styles.sportName}>{skill}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedSkill(skill)}
                                    style={styles.radioButton}
                                >
                                    {selectedSkill === skill ? (
                                        <MaterialIcons name="radio-button-checked" size={24} color="#38A169" />
                                    ) : (
                                        <MaterialIcons name="radio-button-unchecked" size={24} color="#767577" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <Button title={step === 2 ? 'Finish' : 'Next'} onPress={handleNext} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
    },
    section: {
        marginTop: 20,
    },
    radioButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sportName: {
        fontSize: 18,
    },
    radioButton: {
        padding: 8,
    },
});

export default Onboarding;
