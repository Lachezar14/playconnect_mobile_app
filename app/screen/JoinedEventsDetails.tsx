import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from '../context/AuthContext';
import {Event, Participant} from '../utilities/interfaces';
import {
    checkIfCheckedIn,
    checkIfJoined,
    eventJoin,
    eventLeave,
    fetchParticipants,
    updateCheckInStatus
} from "../services/eventParticipationService";

// Define the types for the route params
type RootStackParamList = {
    JoinedEventsDetails: { event: Event };
};

// Define props using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'JoinedEventsDetails'>;

const JoinedEventsDetails: React.FC<Props> = ({ route }) => {
    const { user } = useAuth();
    const { event } = route.params;
    const [isJoined, setIsJoined] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [checkedIn, setCheckedIn] = useState<boolean>(false);

    const availableSpots = event.spots - (event.takenSpots || 0);

    // Fetch participants and their user details
    const handleFetchParticipants = async () => {
        if (!event.id) {
            console.error('Event ID is undefined');
            return;
        }

        try {
            const participantList = await fetchParticipants(event.id); // Use the service here
            setParticipants(participantList); // Set the fetched participants in state
            console.log('Participants: ', participantList);
        } catch (error) {
            console.error('Error fetching participants: ', error);
            Alert.alert('Error fetching participants', 'Please try again later.');
        }
    };

    const handleCheckIfJoined = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            setLoading(false);
            return;
        }

        try {
            const userIsJoined = await checkIfJoined(event.id, user.uid); // Use the service function
            setIsJoined(userIsJoined); // Set isJoined based on the returned value
        } catch (error) {
            console.error('Error checking participation:', error);
        } finally {
            setLoading(false); // Set loading to false once the check is done
        }
    };

    const handleEventJoin = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            await eventJoin(event.id, user.uid);
            setIsJoined(true);
        } catch (error: Error | any) {
            if (error.message === 'No more places available') {
                Alert.alert('Registration Failed', 'Sorry, there are no more available places for this event.');
            } else {
                console.error('Error joining event: ', error);
                Alert.alert('Error joining event', 'An error occurred while trying to join the event. Please try again later.');
            }
        }
    };

    // Unregister the user from the event
    const handleEventLeave = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            await eventLeave(event.id, user.uid);
            setIsJoined(false);
        } catch (error) {
            console.error('Error leaving event: ', error);
            Alert.alert('Error leaving event, please try again');
        }
    };

    const handleCheckIn = async () => {
        if (checkedIn) {
            Alert.alert('Already Checked In', 'You have already checked in for this event.');
            return;
        }

        if (!isCheckInEnabled()) {
            const eventStartDateTime = new Date(event.date);
            const timeUntilCheckIn = eventStartDateTime.getTime() - Date.now() - 15 * 60 * 1000;
            const minutesUntilCheckIn = Math.ceil(timeUntilCheckIn / (60 * 1000));

            Alert.alert(
                'Check-in Not Available',
                `Check-in opens 15 minutes before the event starts. Please try again in ${minutesUntilCheckIn} minutes.`
            );
            return;
        }

        try {
            // Update the check-in status using the service method
            await updateCheckInStatus(event.id, user?.uid);

            setCheckedIn(true); // Set local state
            Alert.alert('Success', 'You have successfully checked in!');
        } catch (error) {
            console.error('Error checking in:', error);
            Alert.alert('Error checking in', 'Please try again later.');
        }
    };

    const isCheckInEnabled = () => {
        const eventStartDateTime = new Date(event.date);
        const currentDateTime = new Date();
        const timeDifference = eventStartDateTime.getTime() - currentDateTime.getTime();
        return timeDifference <= 15 * 60 * 1000 && timeDifference >= 0; // Check if within 15 minutes before the event
    };

    const handleCheckIfCheckedIn = async () => {
        try {
            const isCheckedIn = await checkIfCheckedIn(event.id, user?.uid);
            setCheckedIn(isCheckedIn); // Set local state based on service result
        } catch (error) {
            console.error('Error checking check-in status:', error);
        }
    };

    useEffect(() => {
        handleCheckIfJoined();
        handleFetchParticipants();
        handleCheckIfCheckedIn();
    }, []);

    // Function to map the sport type to an image URL
    const getSportImage = (sport: string) => {
        switch (sport.toLowerCase()) {
            case 'tennis':
                return 'https://plus.unsplash.com/premium_photo-1663045882560-3bdd5f71687c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80';
            case 'padel':
                return 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
            case 'football':
                return 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80';
            case 'basketball':
                return 'https://images.unsplash.com/photo-1559692048-79a3f837883d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80';
            default:
                return 'https://plus.unsplash.com/premium_photo-1667935668767-8a75571d73bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'; // Fallback image if sport doesn't match
        }
    };

    const eventDateTime = new Date(event.date);

    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = eventDateTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={{ uri: getSportImage(event.sportType) }}
                style={styles.image}
            />

            <View style={styles.detailsContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{formattedTime} / {formattedDate}</Text>
                <Text style={styles.eventDescription}>
                    Are you a padel enthusiast? Do you want to play but don’t have a buddy? Fear not!
                    Come to the SportsCentrum Arena and take part in one of the best padel tournaments for
                    professional and enthusiast padel players.
                </Text>
                <Text style={styles.eventLocation}>Address: {event.street} {event.streetNumber}, {event.city}, {event.postcode}</Text>

                <Text style={styles.participantsLabel}>Participants:</Text>
                <View style={styles.participantsContainer}>
                    {participants.map((participant) => (
                        <View key={participant.id} style={styles.participant}>
                            <Text style={styles.participantName}>{participant.firstName}</Text>
                        </View>
                    ))}
                </View>

                {availableSpots > 1 && availableSpots <= 5 && (
                    <Text style={styles.remainingSpots}>
                        Only {availableSpots} spots remaining!
                    </Text>
                )}
                {availableSpots === 1 && (
                    <Text style={styles.remainingSpots}>
                        Only 1 spot remaining!
                    </Text>
                )}

                <TouchableOpacity
                    style={isJoined ? styles.leaveButton : styles.joinButton}
                    onPress={isJoined ? handleEventLeave : handleEventJoin}
                >
                    <Text style={styles.buttonText}>
                        {isJoined ? "Leave Event" : "Join Event"}
                    </Text>
                </TouchableOpacity>

                {isJoined && (
                    <TouchableOpacity
                        style={[
                            styles.checkInButton,
                            (!isCheckInEnabled() || checkedIn) && styles.disabledButton
                        ]}
                        onPress={handleCheckIn}
                    >
                        <Text style={styles.buttonText}>
                            {checkedIn ? "Already Checked In" : "Check In"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 200,
    },
    detailsContainer: {
        padding: 16,
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    eventDate: {
        fontSize: 16,
        color: '#33A02C',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 16,
        color: '#777',
        marginBottom: 16,
    },
    eventLocation: {
        fontSize: 14,
        color: '#555',
        marginBottom: 16,
    },
    participantsLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    participantsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    participant: {
        alignItems: 'center',
        marginRight: 16,
    },
    participantName: {
        marginTop: 4,
        fontSize: 14,
        color: '#333',
    },
    remainingSpots: {
        color: '#d9534f',
        fontSize: 14,
        marginBottom: 16,
    },
    joinButton: {
        backgroundColor: '#5cb85c',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    leaveButton: {
        backgroundColor: '#d9534f',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    checkedInContainer: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    checkInButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
});

export default JoinedEventsDetails;
