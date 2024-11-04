import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import CheckBox from 'react-native-check-box';
import { useAuth } from "../context/AuthContext";
import { fetchUserById, updateUserPreferences } from "../services/userService";

const UserPreferences = () => {
    // List of sports to choose from
    const sportsList = ['Basketball', 'Football', 'Tennis', 'Padel', 'Volleyball'];
    // Skill levels
    const skillLevels = ['Beginner', 'Intermediate', 'Professional'];
    // Days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Keep track of the selected sport (single value)
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    // Keep track of the user's availability (boolean)
    const [isAvailable, setIsAvailable] = useState(true);
    // User skill level
    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    // Availability for each day of the week
    const [availability, setAvailability] = useState({
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
        Sunday: false,
    });

    // Get the current user from the AuthContext
    const { user } = useAuth();

    // Function to toggle the availability switch
    const toggleAvailability = () => setIsAvailable((prev) => !prev);

    // Function to fetch user data from Firestore
    const fetchUser = async () => {
        try {
            const userDoc = await fetchUserById(user?.uid || '');
            if (userDoc) {
                setSelectedSport(userDoc.favouriteSport);
                setIsAvailable(userDoc.isAvailable);
                setSelectedSkill(userDoc.skillLevel);

                // Set availability based on user document
                const userAvailability = userDoc.availability || [];
                const availabilityMap = daysOfWeek.reduce((acc, day) => {
                    acc[day] = userAvailability.includes(day);
                    return acc;
                }, {} as Record<string, boolean>);
                setAvailability(availabilityMap);
            } else {
                console.error('User document not found.');
                setSelectedSport(null);
                setIsAvailable(false);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('Failed to load user data. Please try again later.');
        }
    };

    // Fetch user data when the component mounts
    useEffect(() => {
        fetchUser();
    }, [user?.uid]);

    // Function to save user preferences to Firestore
    const handleSavePreferences = async () => {
        if (!selectedSport || !selectedSkill) {
            Alert.alert('Error', 'Please select a favorite sport and skill level.');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'User not found.');
            return;
        }

        // Create an array of available days
        const availableDays = Object.keys(availability).filter(day => availability[day]);

        try {
            await updateUserPreferences(user.uid, selectedSport, selectedSkill, availableDays);
            Alert.alert('Success', 'Your preferences have been updated.');
        } catch (error) {
            Alert.alert('Error', 'Failed to update preferences. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Favorite Sports Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>Favorite Sport</Text>
                    {sportsList.map((sport) => (
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

                {/* User Availability Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>User Availability</Text>
                    <Text style={styles.description}>
                        Toggle the switch below to indicate if you’re available for sports events in your area.
                    </Text>
                    <View style={styles.switchRow}>
                        <Text style={styles.availabilityText}>I'm Available</Text>
                        <Switch
                            value={isAvailable}
                            onValueChange={toggleAvailability}
                            trackColor={{ false: '#d3d3d3', true: '#d3d3d3' }}
                            thumbColor={isAvailable ? '#38A169' : '#f4f3f4'}
                        />
                    </View>
                    <Text style={styles.subDescription}>
                        When enabled, you may receive invitations for local sports events.
                    </Text>
                </View>

                {/* Skill Level Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>Skill Level</Text>
                    {skillLevels.map((level) => (
                        <View key={level} style={styles.radioButtonRow}>
                            <Text style={styles.sportName}>{level}</Text>
                            <TouchableOpacity
                                onPress={() => setSelectedSkill(level)}
                                style={styles.radioButton}
                            >
                                {selectedSkill === level ? (
                                    <MaterialIcons name="radio-button-checked" size={24} color="#38A169" />
                                ) : (
                                    <MaterialIcons name="radio-button-unchecked" size={24} color="#767577" />
                                )}
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Weekly Availability Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>Availability This Week</Text>
                    {daysOfWeek.map((day) => (
                        <View key={day} style={styles.checkboxRow}>
                            <Text style={styles.sportName}>{day}</Text>
                            <CheckBox
                                isChecked={availability[day]}
                                onClick={() => setAvailability((prev) => ({ ...prev, [day]: !prev[day] }))}
                                checkBoxColor="#38A169"
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity style={styles.button} onPress={handleSavePreferences}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    scrollContent: {
        flexGrow: 1,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        alignSelf: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sportName: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#38A169',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        color: '#6b6b6b',
        marginBottom: 15,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    availabilityText: {
        fontSize: 16,
    },
    subDescription: {
        color: '#6b6b6b',
        marginTop: 10,
    },
    radioButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    radioButton: {
        // Align radio button to the far right
    },
});

export default UserPreferences;
