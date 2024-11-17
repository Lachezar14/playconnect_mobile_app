import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseConfig";
import { doc, runTransaction } from "firebase/firestore";
import {CommonActions} from "@react-navigation/native";

const sports = ['Football', 'Tennis', 'Basketball', 'Running'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];

const Onboarding = ({ route, navigation }) => {
    const [step, setStep] = useState(0);  // Track the current step
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const { password, email, firstName, lastName } = route.params;

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            savePreferences();
            navigation.navigate('Main', {
                screen: 'EventsTab'  // Use the actual tab screen name from MainTabNavigator
            });
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const savePreferences = async () => {
        try {
            const profilePictures = [
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/men/22.jpg",
                "https://randomuser.me/api/portraits/men/45.jpg",
                "https://randomuser.me/api/portraits/men/32.jpg",
                "https://randomuser.me/api/portraits/men/64.jpg"
            ];

            // Select a random profile picture
            const randomProfilePicture = profilePictures[Math.floor(Math.random() * profilePictures.length)];

            const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
            const user = userCredential.user;

            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const userRef = doc(FIRESTORE_DB, 'users', user.uid);
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
                    profilePicture: randomProfilePicture
                });
            });
            console.log(selectedSport, selectedDays, selectedSkill);
        } catch (error) {
            console.log('Error creating user: ', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {step === 0 && (
                <View style={styles.section}>
                    <Text style={styles.heading}>Favourite Sports</Text>
                    <Text style={styles.subheading}>
                        Choose your favourite sports so we can show you events related to those sports!
                    </Text>
                    {sports.map((sport) => (
                        <TouchableOpacity
                            key={sport}
                            style={[
                                styles.radioButtonRow,
                                selectedSport === sport && styles.selectedItem
                            ]}
                            onPress={() => setSelectedSport(sport)}
                        >
                            <Text style={styles.sportName}>{sport}</Text>
                            <MaterialIcons
                                name={selectedSport === sport ? "radio-button-checked" : "radio-button-unchecked"}
                                size={24}
                                color={selectedSport === sport ? "#38A169" : "#767577"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {step === 1 && (
                <View style={styles.section}>
                    <Text style={styles.heading}>What's your skill level?</Text>
                    <Text style={styles.subheading}>
                        Tell us your skill level so we can match you with users of similar skill levels!
                    </Text>
                    {skillLevels.map((skill) => (
                        <TouchableOpacity
                            key={skill}
                            style={[
                                styles.radioButtonRow,
                                selectedSkill === skill && styles.selectedItem
                            ]}
                            onPress={() => setSelectedSkill(skill)}
                        >
                            <Text style={styles.sportName}>{skill}</Text>
                            <MaterialIcons
                                name={selectedSkill === skill ? "radio-button-checked" : "radio-button-unchecked"}
                                size={24}
                                color={selectedSkill === skill ? "#38A169" : "#767577"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {step === 2 && (
                <View style={styles.section}>
                    <Text style={styles.heading}>Which days are you available?</Text>
                    <Text style={styles.subheading}>
                        Select the days you are available to play sports so we can suggest events on those days!
                    </Text>
                    {daysOfWeek.map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.checkboxRow,
                                selectedDays.includes(day) && styles.selectedItem
                            ]}
                            onPress={() => {
                                if (selectedDays.includes(day)) {
                                    setSelectedDays(selectedDays.filter(d => d !== day));
                                } else {
                                    setSelectedDays([...selectedDays, day]);
                                }
                            }}
                        >
                            <Text style={styles.sportName}>{day}</Text>
                            <MaterialIcons
                                name={selectedDays.includes(day) ? "check-box" : "check-box-outline-blank"}
                                size={24}
                                color={selectedDays.includes(day) ? "#38A169" : "#767577"}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.buttonText}>{step === 2 ? 'Finish' : 'Next'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F7F8FA',
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 8,
    },
    subheading: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 24,
    },
    section: {
        marginTop: 20,
    },
    radioButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        marginBottom: 12,
        borderColor: '#E2E8F0',
        borderWidth: 1,
    },
    sportName: {
        fontSize: 18,
        color: '#2D3748',
    },
    selectedItem: {
        borderColor: '#38A169',
        borderWidth: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#CBD5E0',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 0.45,
    },
    nextButton: {
        backgroundColor: '#38A169',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 0.45,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Onboarding;


