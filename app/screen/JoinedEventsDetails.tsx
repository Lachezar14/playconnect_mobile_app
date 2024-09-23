import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { addDoc, collection, updateDoc, doc, query, where, getDocs, runTransaction } from "firebase/firestore";
import { FIRESTORE_DB } from "../../firebaseConfig";
import { useAuth } from '../context/AuthContext';

// Event type definition
interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    spots: number;
    userId: string;
    takenSpots?: number;
}

// Participant type definition
interface Participant {
    id: string;
    firstName: string;
    lastName: string;
}

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
    const fetchParticipants = async () => {
        try {
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('eventId', '==', event.id)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);

            const participantPromises = querySnapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                const userId = data.userId;

                const userQuery = query(
                    collection(FIRESTORE_DB, 'users'),
                    where('userId', '==', userId)
                );
                const userSnapshot = await getDocs(userQuery);

                if (!userSnapshot.empty) {
                    const userData = userSnapshot.docs[0].data();
                    return {
                        id: docSnapshot.id,
                        firstName: userData.firstName,
                        lastName: userData.lastName
                    } as Participant;
                }
                return null;
            });

            const participantList = (await Promise.all(participantPromises)).filter(Boolean) as Participant[];
            setParticipants(participantList);
        } catch (error) {
            console.error('Error fetching participants: ', error);
            Alert.alert('Error fetching participants', 'Please try again later.');
        }
    };

    const checkIfJoined = async () => {
        try {
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('userId', '==', user?.uid),
                where('eventId', '==', event.id)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);
            setIsJoined(!querySnapshot.empty);
        } catch (error) {
            console.error('Error checking participation: ', error);
        } finally {
            setLoading(false);
        }
    };

    const eventRegister = async () => {
        // Implement event registration logic here
        try {
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const eventDocRef = doc(FIRESTORE_DB, 'events', event.id);
                const eventDocSnapshot = await transaction.get(eventDocRef);

                if (!eventDocSnapshot.exists()) {
                    throw new Error('Event does not exist!');
                }

                const currentEventData = eventDocSnapshot.data();
                const availableSpots = currentEventData.spots;
                const takenSpots = currentEventData.takenSpots || 0;
                const totalSpots = availableSpots - takenSpots;

                if (totalSpots <= 0) {
                    throw new Error('No more places available');
                }

                const eventParticipantsCollection = collection(FIRESTORE_DB, 'eventParticipants');
                await addDoc(eventParticipantsCollection, {
                    userId: user?.uid,
                    eventId: event.id,
                    joinedAt: new Date().toISOString(),
                });

                transaction.update(eventDocRef, {
                    takenSpots: takenSpots + 1,
                });
            });

            setIsJoined(true);
        } catch (error: any) {
            if (error.message === 'No more places available') {
                Alert.alert('Registration Failed', 'Sorry, there are no more available places for this event.');
            } else {
                console.error('Error joining event: ', error);
                Alert.alert('Error joining event', 'An error occurred while trying to join the event. Please try again later.');
            }
        }
    };

    const eventLeave = async () => {
        try {
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const eventParticipantsQuery = query(
                    collection(FIRESTORE_DB, 'eventParticipants'),
                    where('userId', '==', user?.uid),
                    where('eventId', '==', event.id)
                );
                const querySnapshot = await getDocs(eventParticipantsQuery);

                if (querySnapshot.empty) {
                    throw new Error('You are not registered for this event');
                }

                const eventDocRef = doc(FIRESTORE_DB, 'events', event.id);
                const eventDocSnapshot = await transaction.get(eventDocRef);

                if (!eventDocSnapshot.exists()) {
                    throw new Error('Event does not exist!');
                }

                const currentEventData = eventDocSnapshot.data();
                const takenSpots = currentEventData.takenSpots || 0;

                if (takenSpots <= 0) {
                    throw new Error('Error: No places to decrement');
                }

                querySnapshot.forEach((docSnapshot) => {
                    const participantDocRef = doc(FIRESTORE_DB, 'eventParticipants', docSnapshot.id);
                    transaction.delete(participantDocRef);
                });

                transaction.update(eventDocRef, {
                    takenSpots: takenSpots - 1,
                });
            });

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
            const eventStartDateTime = new Date(`${event.date}T${event.time}`);
            const timeUntilCheckIn = eventStartDateTime.getTime() - Date.now() - 15 * 60 * 1000;
            const minutesUntilCheckIn = Math.ceil(timeUntilCheckIn / (60 * 1000));

            Alert.alert(
                'Check-in Not Available',
                `Check-in opens 15 minutes before the event starts. Please try again in ${minutesUntilCheckIn} minutes.`
            );
            return;
        }

        try {
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('userId', '==', user?.uid),
                where('eventId', '==', event.id)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);

            if (querySnapshot.empty) {
                throw new Error('You are not registered for this event');
            }

            const participantDoc = querySnapshot.docs[0];
            const participantDocRef = doc(FIRESTORE_DB, 'eventParticipants', participantDoc.id);

            await updateDoc(participantDocRef, {
                isCheckedIn: true,
                checkedInAt: new Date().toISOString(),
            });

            setCheckedIn(true);
            Alert.alert('Success', 'You have successfully checked in!');
        } catch (error) {
            console.error('Error checking in: ', error);
            Alert.alert('Error checking in', 'Please try again later.');
        }
    };

    const isCheckInEnabled = () => {
        const eventStartDateTime = new Date(`${event.date}T${event.time}`);
        const currentDateTime = new Date();
        const timeDifference = eventStartDateTime.getTime() - currentDateTime.getTime();
        return timeDifference <= 15 * 60 * 1000 && timeDifference >= 0; // Check if within 15 minutes before the event
    };

    const checkIfCheckedIn = async () => {
        try {
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('userId', '==', user?.uid),
                where('eventId', '==', event.id),
                where('isCheckedIn', '==', true)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);
            setCheckedIn(!querySnapshot.empty);
        } catch (error) {
            console.error('Error checking check-in status: ', error);
        }
    };

    useEffect(() => {
        checkIfJoined();
        fetchParticipants();
        checkIfCheckedIn();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                style={styles.image}
                source={{ uri: 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' }}
            />

            <View style={styles.detailsContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}/{event.time}</Text>
                <Text style={styles.eventDescription}>
                    Are you a padel enthusiast? Do you want to play but don’t have a buddy? Fear not!
                    Come to the SportsCentrum Arena and take part in one of the best padel tournaments for
                    professional and enthusiast padel players.
                </Text>
                <Text style={styles.eventLocation}>Address: {event.location}</Text>

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
                    onPress={isJoined ? eventLeave : eventRegister}
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
