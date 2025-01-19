import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { fetchUserById, updateUserPreferences } from "../../services/userService";

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Mapping of sports to their corresponding icons
const sportIcons = {
    Football: "soccer",
    Basketball: "basketball",
    Tennis: "tennis",
    Padel: "table-tennis",
};

const sportsList = Object.keys(sportIcons); // Get the list of sport names

const UserPreferences = () => {
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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Favorite Sports Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>Favorite Sport</Text>
                    <Text style={styles.description}>
                        Select your favorite sport. This will help tailor event suggestions to your interests.
                    </Text>
                    <View style={styles.sportButtonContainer}>
                        {sportsList.map((sport) => (
                            <TouchableOpacity
                                key={sport}
                                style={[
                                    styles.sportButton,
                                    selectedSport === sport && styles.sportButtonSelected, // Highlight selected sport
                                ]}
                                onPress={() => setSelectedSport(sport)}
                            >
                                <MaterialCommunityIcons
                                    name={sportIcons[sport]} // Dynamically use the correct icon based on sport
                                    size={24}
                                    color={selectedSport === sport ? "#fff" : "#6b6b6b"} // Icon color changes based on selection
                                    style={styles.sportIcon}
                                />
                                <Text
                                    style={[
                                        styles.sportButtonText,
                                        selectedSport === sport && styles.sportButtonTextSelected, // Change text color for selected sport
                                    ]}
                                >
                                    {sport}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Skill Level Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>Skill Level</Text>
                    <Text style={styles.description}>
                        Your skill level is system-calculated based on activity, match feedback, and scores. It updates automatically over time.
                    </Text>
                    <View style={styles.skillLevelRow}>
                        <Text style={styles.skillLevelText}>Your Skill Level:</Text>
                        <Text style={styles.skillLevelValue}>{selectedSkill || 'N/A'}</Text>
                    </View>
                </View>

                {/* Weekly Availability Section */}
                <View style={styles.section}>
                    <Text style={styles.title}>Availability This Week</Text>
                    <Text style={styles.description}>
                        Select the days you are available for sports events.
                    </Text>
                    <View style={styles.dayButtonContainer}>
                        {daysOfWeek.slice(0, 4).map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayButton,
                                    availability[day] && styles.dayButtonSelected, // Highlight selected buttons
                                ]}
                                onPress={() => setAvailability((prev) => ({ ...prev, [day]: !prev[day] }))}
                            >
                                <Text
                                    style={[
                                        styles.dayButtonText,
                                        availability[day] && styles.dayButtonTextSelected, // Change text color for selected buttons
                                    ]}
                                >
                                    {day.slice(0, 3)} {/* Shortened day name */}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.dayButtonContainer}>
                        {daysOfWeek.slice(4).map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayButton,
                                    availability[day] && styles.dayButtonSelected, // Highlight selected buttons
                                ]}
                                onPress={() => setAvailability((prev) => ({ ...prev, [day]: !prev[day] }))}
                            >
                                <Text
                                    style={[
                                        styles.dayButtonText,
                                        availability[day] && styles.dayButtonTextSelected, // Change text color for selected buttons
                                    ]}
                                >
                                    {day.slice(0, 3)} {/* Shortened day name */}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
    skillLevelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    skillLevelText: {
        fontSize: 16,
        color: '#6b6b6b',
    },
    skillLevelValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#38A169',
    },
    dayButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center the buttons horizontally
        alignItems: 'center',      // Align buttons vertically (if necessary)
        marginTop: 1,
        marginBottom: 1,
        flexWrap: 'wrap', // Allow wrapping to a new line
    },
    dayButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 4, // Add margin to ensure buttons have space between them
    },
    dayButtonSelected: {
        backgroundColor: '#38A169', // Highlight color for selected days
    },
    dayButtonText: {
        fontSize: 14,
        color: '#6b6b6b',
        fontWeight: 'bold',
    },
    dayButtonTextSelected: {
        color: '#fff', // Text color for selected days
    },
    sportButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap', // Allow wrapping if needed
        marginTop: 10,
        marginBottom: 10,
    },
    sportButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 16, // Adjust for square corners
        margin: 5, // Add space between the buttons
        alignItems: 'center',
        width: 140, // Adjust width to make it square-like
        height: 60, // Keep height equal to width for a square shape
        textAlign: 'center',
        flexDirection: 'row', // Align text and icon horizontally
    },
    sportButtonSelected: {
        backgroundColor: '#38A169', // Highlight color for selected sport
    },
    sportIcon: {
        marginRight: 8, // Add some space between the icon and text
    },
    sportButtonText: {
        fontSize: 14,
        color: '#6b6b6b',
        fontWeight: 'bold',
    },
    sportButtonTextSelected: {
        color: '#fff', // Change text color for selected sport
    },
});

export default UserPreferences;
