import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View, Text, StyleSheet, ActivityIndicator, RefreshControl} from 'react-native';
import EventCardSmall from "../components/event/EventCardSmall";
import {getUserLocation} from "../services/locationService";
import {addDistanceToEvents, fetchEventsJoinedByUserID, fetchEventsLikedByUser} from "../services/eventService";
import {useAuth} from "../context/AuthContext";
import {Event} from "../utilities/interfaces";


const MyEvents = () => {
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
    const [likedEvents, setLikedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const { user } = useAuth();

    const fetchJoinedEvents = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userLocation = await getUserLocation();
            let fetchedEvents = await fetchEventsJoinedByUserID(user.uid);

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
            console.error("Error fetching liked events: ", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Fetch data only on initial render
    useEffect(() => {
        fetchJoinedEvents();
        handleLikedEvents();
    }, [fetchJoinedEvents, handleLikedEvents]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchJoinedEvents();
        await handleLikedEvents();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >

            {/* Joined Events Section */}
            <Text style={styles.sectionTitle}>Joined Events</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.scrollContainer}
            >
                {joinedEvents.length === 0 ? (
                    <Text style={styles.emptyText}>No joined events yet</Text>
                ) : (
                    joinedEvents.map(event => (
                        <EventCardSmall key={event.id} event={event} />
                    ))
                )}
            </ScrollView>
            {/* Liked Events Section */}
            <Text style={styles.sectionTitle}>Liked Events</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.scrollContainer}
            >
                {likedEvents.length === 0 ? (
                    <Text style={styles.emptyText}>You have not liked any events yet</Text>
                ) : (
                    likedEvents.map(event => (
                        <EventCardSmall key={event.id} event={event} />
                    ))
                )}
            </ScrollView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: 10,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        paddingVertical: 10, // Adjust this value to create space above and below content
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 20,
        color: 'gray',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#888',  // Example color
    },
});

export default MyEvents;
