import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Button} from 'react-native';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useAuth } from '../context/AuthContext';
import {Event, Participant} from '../utilities/interfaces';
import {eventLeave, eventJoin, checkIfJoined, fetchParticipants} from "../services/eventParticipationService";

// Define the types for the route params
type RootStackParamList = {
    EventDetails: { event: Event }; // Replace 'any' with the appropriate type for event
};

// Define props using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

const EventDetails: React.FC<Props> = ({ route, navigation }) => {
    const { user } = useAuth(); // Get the user object from the AuthContext
    const { event } = route.params; // Get event details passed through navigation
    const [isJoined, setIsJoined] = useState<boolean>(false); // State to track if the user has joined
    const [loading, setLoading] = useState<boolean>(true); // State to track loading
    const [participants, setParticipants] = useState<Participant[]>([]); // For real participant data

    const availableSpots = event.spots - (event.takenSpots || 0); // Calculate available spots

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

    // Check if the user has joined the event
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

    useEffect(() => {
        handleCheckIfJoined(); // Check if the user is already registered when the component mounts
        handleFetchParticipants(); // Fetch the participants list
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

                {
                    availableSpots> 1 && availableSpots <= 5
                        ? <Text style={styles.remainingSpots}>
                            Only {availableSpots} spots remaining!
                        </Text>
                        : availableSpots == 1 ?
                        <Text style={styles.remainingSpots}>
                            Only 1 spot remaining!
                        </Text>
                            : null
                }

                {/* Render join/leave button based on the user's status */}
                <TouchableOpacity
                    style={isJoined ? styles.leaveButton : styles.joinButton}
                    onPress={isJoined ? handleEventLeave : handleEventJoin}
                >
                    <Text style={styles.buttonText}>
                        {isJoined ? "Leave Event" : "Join Event"}
                    </Text>
                </TouchableOpacity>
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
    button: {
        backgroundColor: '#33A02C',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    joinButton: {
        backgroundColor: '#33A02C',
        borderRadius: 22,
        paddingVertical: 14,
        alignItems: 'center',
    },
    leaveButton: {
        backgroundColor: '#d9534f',
        borderRadius: 22,
        paddingVertical: 14,
        alignItems: 'center',
    },
});

export default EventDetails;
