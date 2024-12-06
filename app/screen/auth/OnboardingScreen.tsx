import React, { useState } from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Feather, MaterialIcons} from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseConfig";
import { doc, runTransaction } from "firebase/firestore";

const sports = ['Football', 'Tennis', 'Basketball', 'Padel'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const skillLevels = ['Beginner', 'Intermediate', 'Advanced'];

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

            {step === 0 && (
                <View style={styles.section}>
                    <Text style={styles.heading}>What do you like?</Text>
                    <Text style={styles.subheading}>
                        Choose the picture that best represents you and your interests!
                    </Text>
                    <View style={styles.cardContainer}>
                        {[
                            { name: 'Football', image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=3164&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                            { name: 'Tennis', image: 'https://plus.unsplash.com/premium_photo-1663045882560-3bdd5f71687c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80' },
                            { name: 'Basketball', image: 'https://plus.unsplash.com/premium_photo-1668767725891-58f5cd788105?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
                            { name: 'Padel', image: 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' },
                        ].map((sport) => (
                            <TouchableOpacity
                                key={sport.name}
                                style={[
                                    styles.card,
                                    selectedSport === sport.name && styles.selectedCard,
                                ]}
                                onPress={() => setSelectedSport(sport.name)}
                            >
                                <ImageBackground
                                    source={{ uri: sport.image }}
                                    style={styles.sportImage}
                                >
                                    <View style={styles.imageOverlay}>
                                        {/* Circle with checkmark icon when selected */}
                                        {selectedSport === sport.name && (
                                            <View style={styles.selectionCircle}>
                                                <Feather name="check" size={16} color="black" />
                                            </View>
                                        )}
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {step === 1 && (
                <View style={styles.section}>
                    <Text style={styles.heading}>How good are you?</Text>
                    <Text style={styles.subheading}>
                        Tell us how good are you at your favourite sport!
                    </Text>
                    <View style={styles.verticalCardContainer}>
                        {[
                            { level: 'Advanced', stars: '★★★' },
                            { level: 'Intermediate', stars: '★★' },
                            { level: 'Beginner', stars: '★' },
                        ].map((skill) => (
                            <TouchableOpacity
                                key={skill.level}
                                style={[
                                    styles.skillCardVertical,
                                    selectedSkill === skill.level && styles.selectedSkillCard,
                                ]}
                                onPress={() => setSelectedSkill(skill.level)}
                            >
                                <Text
                                    style={[
                                        styles.skillStars,
                                        selectedSkill === skill.level && styles.selectedSkillStars,
                                    ]}
                                >
                                    {skill.stars}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {step === 2 && (
                <View style={styles.section}>
                    <Text style={styles.heading}>Which days are you available?</Text>
                    <Text style={styles.subheading}>
                        Select the days you are available to play sports so we can suggest events on those days!
                    </Text>
                    <View style={styles.dayCardContainer}>
                        {daysOfWeek.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayCard,
                                    selectedDays.includes(day) && styles.selectedDayCard
                                ]}
                                onPress={() => {
                                    if (selectedDays.includes(day)) {
                                        setSelectedDays(selectedDays.filter(d => d !== day));
                                    } else {
                                        setSelectedDays([...selectedDays, day]);
                                    }
                                }}
                            >
                                <Text style={styles.dayText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    card: {
        width: '48%',
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        height: 200, // Longer cards
    },
    sportImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Black filter
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCard: {
        borderWidth: 4,
        borderColor: '#38A169', // Clearer green border
    },
    // Circle at the bottom right
    selectionCircle: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 25,
        height: 25,
        borderRadius: 12.5, // Circle shape
        backgroundColor: '#d3d3d3', // Light gray color for the circle
        justifyContent: 'center',
        alignItems: 'center', // Center the icon inside the circle
        borderWidth: 2,
        borderColor: '#d3d3d3', // Green border around the circle
    },
    verticalCardContainer: {
        marginTop: 10,
    },
    skillCardVertical: {
        width: '100%',
        height: 80, // Adjust height for vertical layout
        borderRadius: 10,
        backgroundColor: '#f2f3f4',
        borderColor: '#e8eaec',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 15, // Spacing between cards
    },
    selectedSkillCard: {
        borderColor: '#38A169', // Green border for selected card
    },
    skillStars: {
        fontSize: 36, // Big stars
        color: '#FFD700', // Gold color
    },
    selectedSkillStars: {
        color: '#FFB800', // Slightly brighter gold for selection
    },
    dayCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    dayCard: {
        width: '48%',
        height: 70, // Adjusted height to match the skill card's size
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#e8eaec',
        backgroundColor: '#f2f3f4',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 12,
    },
    dayText: {
        fontSize: 18,
        color: '#2D3748',
        fontWeight: 'bold',
    },
    selectedDayCard: {
        borderColor: '#38A169', // Selected card color
        backgroundColor: '#F0FFF4', // Light green background when selected
        borderWidth: 2,
    },
});

export default Onboarding;


