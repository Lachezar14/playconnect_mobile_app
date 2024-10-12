import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert} from 'react-native';
import {MaterialIcons} from "@expo/vector-icons";
import {useAuth} from "../context/AuthContext";
import {fetchUserById, updateUserPreferences} from "../services/userService";

const UserPreferences = () => {
    // List of sports to choose from
    const sportsList = ['Basketball', 'Football', 'Tennis', 'Padel', 'Volleyball'];
    // Keep track of the selected sport (single value)
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    // Keep track of the user's availability (boolean)
    const [isAvailable, setIsAvailable] = useState(true);
    // Get the current user from the AuthContext
    const { user } = useAuth();

    // Function to toggle the availability switch
    const toggleAvailability = () => setIsAvailable((prev) => !prev);

    // Function to fetch user data from Firestore
    const fetchUser = async () => {
        try {
            // Fetch user data from Firestore
            const userDoc = await fetchUserById(user?.uid || '');

            if (userDoc) {
                setSelectedSport(userDoc.favouriteSport);
                setIsAvailable(userDoc.isAvailable);
            } else {
                console.error('User document not found.');
                // Optionally, you can set default states or show a message to the user
                setSelectedSport(null); // Or any default value
                setIsAvailable(false); // Or any default value
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            // Optionally, display a message to the user
            alert('Failed to load user data. Please try again later.');
        }
    };

    // Fetch user data when the component mounts
    useEffect(() => {
        fetchUser();
    }, [user?.uid]);

    // Function to save user preferences to Firestore
    const handleSavePreferences = async () => {
        if (!selectedSport) {
            Alert.alert('Error', 'Please select a favorite sport.');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'User not found.');
            return;
        }

        try {
            // Call the new userService method to update user preferences in Firestore
            await updateUserPreferences(user?.uid, selectedSport, isAvailable);
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
                            trackColor={{ false: '#d3d3d3', true: '#d3d3d3' }} // Gray background for both states
                            thumbColor={isAvailable ? '#38A169' : '#f4f3f4'} // Green thumb when enabled
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
        marginTop: 'auto', // Push the button to the bottom
        marginBottom: 20, // Add some space from the bottom edge
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