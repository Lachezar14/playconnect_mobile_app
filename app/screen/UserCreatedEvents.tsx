import React, { useCallback, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EventCard from '../components/EventCard';  // Assuming you already created this component
import { useAuth } from '../context/AuthContext';
import {getUserLocation} from "../services/locationService";
import { addDistanceToEvents, fetchEventsCreatedByUser } from "../services/eventService";
import { Event } from '../utilities/interfaces';

const UserCreatedEvents = () => {
    const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();

    const fetchCreatedEvents = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userLocation = await getUserLocation();
            let fetchedEvents = await fetchEventsCreatedByUser(user.uid);

            if (userLocation) {
                fetchedEvents = addDistanceToEvents(fetchedEvents, userLocation.latitude, userLocation.longitude);
            }

            setCreatedEvents(fetchedEvents);
        } catch (error) {
            console.error("Error fetching joined events: ", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchCreatedEvents();
        }, [fetchCreatedEvents])
    );

    // Triggers loading state everytime the page is open, too buggy
    // if (loading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color="#0000ff" />
    //             <Text>Loading Joined Events...</Text>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.container}>
            {createdEvents.length > 0 ? (
                <FlatList
                    data={createdEvents}
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

export default UserCreatedEvents;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
