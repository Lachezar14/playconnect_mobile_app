import React, { useCallback, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import EventCard from '../components/event/EventCard';  // Assuming you already created this component
import { useAuth } from '../context/AuthContext';
import {getUserLocation} from "../services/locationService";
import {addDistanceToEvents, fetchEventsLikedByUser} from "../services/eventService";
import { Event } from '../utilities/interfaces';

// JoinedEvents component to render the list of joined events
const UserLikedEvents = () => {
    const [likedEvents, setLikedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();

    const handleLikedEvents = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userLocation = await getUserLocation();
            let fetchedEvents = await fetchEventsLikedByUser(user.uid);

            if (userLocation) {
                fetchedEvents = addDistanceToEvents(fetchedEvents, userLocation.latitude, userLocation.longitude);
            }

            setLikedEvents(fetchedEvents);
        } catch (error) {
            console.error("Error fetching joined events: ", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            handleLikedEvents();
        }, [handleLikedEvents])
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
            {likedEvents.length > 0 ? (
                <FlatList
                    data={likedEvents}
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

export default UserLikedEvents;

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
