import React, { useState } from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseConfig";
import { doc, runTransaction } from "firebase/firestore";
import SportCards from "../../components/onboarding/SportCards";
import SkillLevelCards from "../../components/onboarding/SkillLevelCards";
import DayCards from "../../components/onboarding/DayCards";

const Onboarding = ({ route, navigation }) => {
    const [step, setStep] = useState(0);  // Track the current step
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const { password, email, firstName, lastName } = route.params;

    const totalSteps = 3; // Total number of steps in the onboarding

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
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${((step + 1) / totalSteps) * 100}%` }
                    ]}
                />
            </View>

            {/* Favourite Sport */}
            {step === 0 && (
                    <SportCards
                        selectedSport={selectedSport}
                        onSelectSport={setSelectedSport}
                    />
            )}

            {/* Skill Level */}
            {step === 1 && (
                <SkillLevelCards
                    selectedSkill={selectedSkill}
                    onSelectSkill={setSelectedSkill}
                />
            )}

            {/* Availability */}
            {step === 2 && (
                <DayCards
                    selectedDays={selectedDays}
                    onSelectDays={setSelectedDays}
                />
            )}

            {/* Back & Next Buttons */}
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
    progressBarContainer: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#38A169',
    },
});

export default Onboarding;


