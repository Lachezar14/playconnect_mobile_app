import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity} from 'react-native';
import EventCardSmall from "../../components/event/EventCardSmall";
import {getUserLocation} from "../../services/locationService";
import {
    addDistanceToEvents,
    fetchEventsCreatedByUser,
    fetchEventsJoinedByUserID,
    fetchEventsLikedByUser
} from "../../services/eventService";
import {useAuth} from "../../context/AuthContext";
import {Event} from "../../utilities/interfaces";
import {useFocusEffect} from "@react-navigation/native";
import {Feather} from "@expo/vector-icons";


const MyEvents = ({navigation} : any) => {
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
    const [likedEvents, setLikedEvents] = useState<Event[]>([]);
    const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
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
            console.error("Error fetching created events: ", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchJoinedEvents();
            handleLikedEvents();
            fetchCreatedEvents();
        }, [fetchJoinedEvents, handleLikedEvents, fetchCreatedEvents])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchJoinedEvents();
        await handleLikedEvents();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <ScrollView
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

                {/* Created Events Section */}
                <Text style={styles.sectionTitle}>Created Events</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {createdEvents.length === 0 ? (
                        <Text style={styles.emptyText}>You have not created any events yet</Text>
                    ) : (
                        createdEvents.map(event => (
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

            {/* Circle Plus Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateEvent')}
            >
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1, // Use flex: 1 to allow the ScrollView to take full space
        paddingLeft: 10,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        paddingVertical: 10,
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
        color: '#888',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'green', // Change color as needed
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
    },
});

export default MyEvents;
