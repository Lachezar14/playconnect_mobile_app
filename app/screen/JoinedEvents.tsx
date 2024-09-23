import React, { useCallback, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { FIRESTORE_DB } from "../../firebaseConfig";
import EventCard from '../components/EventCard';  // Assuming you already created this component
import { useAuth } from '../context/AuthContext';

// Event type definition
interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    availablePlaces: number;
    userId: string;
}

interface EventParticipant {
    userId: string;
    eventId: string;
    joinedAt: string;
}

// JoinedEvents component to render the list of joined events
const JoinedEvents = () => {
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { user } = useAuth();  // Assuming you have a custom hook to get the logged-in user info

    // Fetch the joined events for the logged-in user
    const fetchJoinedEvents = async () => {
        if (!user) return;

        try {
            // Step 1: Query the eventParticipants collection for the logged-in user
            const participantsCollection = collection(FIRESTORE_DB, 'eventParticipants');
            const q = query(participantsCollection, where('userId', '==', user.uid));  // Use logged-in user's UID
            const participantsSnapshot = await getDocs(q);

            // Step 2: Get all eventId's the user has joined
            const eventIds = participantsSnapshot.docs.map(doc => doc.data().eventId);

            if (eventIds.length === 0) {
                setJoinedEvents([]);  // No events joined
                return;
            }

            // Step 3: Fetch event details from the events collection for the joined eventIds
            const eventsCollection = collection(FIRESTORE_DB, 'events');
            const eventDocs = await getDocs(eventsCollection);
            const eventsList: Event[] = eventDocs.docs
                .filter(doc => eventIds.includes(doc.id))  // Filter by eventIds
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Event[];

            setJoinedEvents(eventsList);
        } catch (error) {
            console.error("Error fetching joined events: ", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJoinedEvents();
        }, [user])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading Joined Events...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {joinedEvents.length > 0 ? (
                <FlatList
                    data={joinedEvents}
                    renderItem={({ item }) => (
                        <EventCard
                            event={item}
                            targetPage="JoinedEventsDetails"  // Specify the target page for joined events
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <Text>No events joined yet.</Text>
            )}
        </View>
    );
};

export default JoinedEvents;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
