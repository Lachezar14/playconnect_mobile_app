import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Button} from 'react-native';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { addDoc, collection, deleteDoc, doc, query, where, getDocs, runTransaction }  from "firebase/firestore";
import {FIRESTORE_DB} from "../../firebaseConfig";
import { useAuth } from '../context/AuthContext';

// Event type definition
interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    spots: number;
    userId: string;
    takenSpots?: number;
    street: string;
    streetNumber: string;
    city: string;
    postcode: string;
}

// Participant type definition
interface Participant {
    id: string;
    firstName: string;
    lastName: string;
}

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
    const fetchParticipants = async () => {
        try {
            // Step 1: Get all participants from `eventParticipants` table based on `eventId`
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('eventId', '==', event.id)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);

            const participantPromises = querySnapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                const userId = data.userId;

                // Step 2: Fetch the corresponding user details from the `users` collection
                const userQuery = query(
                    collection(FIRESTORE_DB, 'users'),
                    where('userId', '==', userId)
                );
                const userSnapshot = await getDocs(userQuery);

                // Assuming each `userQuery` has only one user
                if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();
                    return { id: userId, firstName: userData.firstName, lastName: userData.lastName } as Participant;
                }
                return null;
            });

            // Step 3: Resolve all promises and filter out null values
            const participantList = (await Promise.all(participantPromises)).filter(Boolean) as Participant[];
            setParticipants(participantList);
            console.log('Participants: ', participantList);
        } catch (error) {
            console.error('Error fetching participants: ', error);
            Alert.alert('Error fetching participants', 'Please try again later.');
        }
    };

    // Check if the user has joined the event
    const checkIfJoined = async () => {
        try {
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('userId', '==', user?.uid),
                where('eventId', '==', event.id)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);

            // If the user is found in the participants list
            setIsJoined(!querySnapshot.empty);
        } catch (error) {
            console.error('Error checking participation: ', error);
        } finally {
            setLoading(false); // Set loading to false once the check is done
        }
    };

    const eventRegister = async () => {
        // Implement event registration logic here
        try {
            // Start a Firestore transaction
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                // Step 1: Get a reference to the event document in the events collection
                const eventDocRef = doc(FIRESTORE_DB, 'events', event.id);

                // Step 2: Read the current event data inside the transaction
                const eventDocSnapshot = await transaction.get(eventDocRef);

                if (!eventDocSnapshot.exists()) {
                    throw new Error('Event does not exist!');
                }

                // Get current data
                const currentEventData = eventDocSnapshot.data();

                // Check if there are available places
                const availableSpots = currentEventData.spots;
                const takenSpots = currentEventData.takenSpots || 0; // Default to 0 if it doesn't exist yet
                const totalSpots = availableSpots - takenSpots;

                if (totalSpots <= 0) {
                    throw new Error('No more places available');
                }

                // Step 3: Add the user to the eventParticipants collection
                const eventParticipantsCollection = collection(FIRESTORE_DB, 'eventParticipants');
                await addDoc(eventParticipantsCollection, {
                    userId: user?.uid,
                    eventId: event.id,
                    joinedAt: new Date().toISOString(),
                });

                // Step 4: Increment the occupiedPlaces field in the event document
                transaction.update(eventDocRef, {
                    takenSpots: takenSpots + 1,
                });
            });

            // If the transaction succeeds, update the state
            setIsJoined(true); // Update the button state

        } catch (error: any) {
            // Custom error handling for specific messages
            if (error.message === 'No more places available') {
                Alert.alert('Registration Failed', 'Sorry, there are no more available places for this event.');
            } else {
                console.error('Error joining event: ', error); // Log the actual error
                Alert.alert('Error joining event', 'An error occurred while trying to join the event. Please try again later.');
            }
        }
    };

    // Unregister the user from the event
    const eventLeave = async () => {
        try {
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                // Step 1: Query the eventParticipants collection to find the user's entry
                const eventParticipantsQuery = query(
                    collection(FIRESTORE_DB, 'eventParticipants'),
                    where('userId', '==', user?.uid),
                    where('eventId', '==', event.id)
                );
                const querySnapshot = await getDocs(eventParticipantsQuery);

                if (querySnapshot.empty) {
                    throw new Error('You are not registered for this event');
                }

                // Step 2: Read the event document in the events collection
                const eventDocRef = doc(FIRESTORE_DB, 'events', event.id);
                const eventDocSnapshot = await transaction.get(eventDocRef);

                if (!eventDocSnapshot.exists()) {
                    throw new Error('Event does not exist!');
                }

                // Get the current occupied places
                const currentEventData = eventDocSnapshot.data();
                const takenSpots = currentEventData.takenSpots || 0;

                // Prevent decrementing below 0
                if (takenSpots <= 0) {
                    throw new Error('Error: No places to decrement');
                }

                // Now that all reads are done, proceed with the writes

                // Step 3: Delete the participant's document
                querySnapshot.forEach((docSnapshot) => {
                    const participantDocRef = doc(FIRESTORE_DB, 'eventParticipants', docSnapshot.id);
                    transaction.delete(participantDocRef);
                });

                // Step 4: Decrement the occupiedPlaces field in the event document
                transaction.update(eventDocRef, {
                    takenSpots: takenSpots - 1,
                });
            });

            // If the transaction succeeds, update the state
            setIsJoined(false); // Update the button state

        } catch (error) {
            console.error('Error leaving event: ', error);
            Alert.alert('Error leaving event, please try again');
        }
    };

    useEffect(() => {
        checkIfJoined(); // Check if the user is already registered when the component mounts
        fetchParticipants(); // Fetch the participants list
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                style={styles.image}
                source={{ uri: 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }} // Placeholder event image
            />

            <View style={styles.detailsContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}/{event.time}</Text>
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
                    onPress={isJoined ? eventLeave : eventRegister}
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
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    leaveButton: {
        backgroundColor: '#d9534f',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
});

export default EventDetails;
