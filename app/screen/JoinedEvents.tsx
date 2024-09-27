import React, { useCallback, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EventCard from '../components/EventCard';  // Assuming you already created this component
import { useAuth } from '../context/AuthContext';
import {getUserLocation} from "../services/locationService";
import {addDistanceToEvents, fetchEventsByUserId} from "../services/eventService";
import { Event } from '../utilities/interfaces';

// JoinedEvents component to render the list of joined events
const JoinedEvents = () => {
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();

    const fetchJoinedEvents = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userLocation = await getUserLocation();
            let fetchedEvents = await fetchEventsByUserId(user.uid);

            if (userLocation) {
                fetchedEvents = addDistanceToEvents(fetchedEvents, userLocation.latitude, userLocation.longitude);
            }

            setJoinedEvents(fetchedEvents);
        } catch (error) {
            console.error("Error fetching joined events: ", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchJoinedEvents();
        }, [fetchJoinedEvents])
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
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
