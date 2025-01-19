import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity} from 'react-native';
import EventCardSmall from "../../components/event/EventCardSmall";
import {getUserLocation} from "../../services/locationService";
import {
    addDistanceToEvents,
    fetchEventsCreatedByUser,
    fetchEventsJoinedByUserID,
} from "../../services/eventService";
import {useAuth} from "../../context/AuthContext";
import {Event} from "../../utilities/interfaces";
import {useFocusEffect} from "@react-navigation/native";
import {Feather} from "@expo/vector-icons";
import {SafeAreaView} from "react-native-safe-area-context";
import EventCardSmallSkeleton from "../../components/event/EventCardSmallSkeleton";

const MyEvents = ({navigation} : any) => {
    const [activeTab, setActiveTab] = useState('all');
    const [joinedEvents, setJoinedEvents] = useState<Event[]>([]);
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
            fetchCreatedEvents();
        }, [fetchJoinedEvents, fetchCreatedEvents])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchJoinedEvents();
        await fetchCreatedEvents();
        setRefreshing(false);
    };

    const TabButton = ({ title, isActive, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.tabButton,
                isActive && styles.activeTabButton
            ]}
        >
            <Text style={[
                styles.tabButtonText,
                isActive && styles.activeTabButtonText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Events</Text>
            </View>

            <View style={styles.tabContainer}>
                <TabButton
                    title="All"
                    isActive={activeTab === 'all'}
                    onPress={() => setActiveTab('all')}
                />
                <TabButton
                    title="Joined"
                    isActive={activeTab === 'joined'}
                    onPress={() => setActiveTab('joined')}
                />
                <TabButton
                    title="Created"
                    isActive={activeTab === 'created'}
                    onPress={() => setActiveTab('created')}
                />
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                style={styles.contentContainer}
            >
                {activeTab === 'all' || activeTab === 'joined' ? (
                    <>
                        <Text style={styles.sectionTitle}>Joined Events</Text>
                        <View style={styles.eventsContainer}>
                            {loading ? (
                                // Show multiple skeleton cards while loading
                                Array(3).fill(0).map((_, index) => (
                                    <EventCardSmallSkeleton key={`skeleton-joined-${index}`} />
                                ))
                            ) : joinedEvents.length === 0 ? (
                                <Text style={styles.emptyText}>No joined events yet</Text>
                            ) : (
                                joinedEvents.map(event => (
                                    <EventCardSmall key={event.id} event={event} />
                                ))
                            )}
                        </View>
                    </>
                ) : null}

                {activeTab === 'all' || activeTab === 'created' ? (
                    <>
                        <Text style={styles.sectionTitle}>Created Events</Text>
                        <View style={styles.eventsContainer}>
                            {loading ? (
                                // Show multiple skeleton cards while loading
                                Array(3).fill(0).map((_, index) => (
                                    <EventCardSmallSkeleton key={`skeleton-created-${index}`} />
                                ))
                            ) : createdEvents.length === 0 ? (
                                <Text style={styles.emptyText}>You have not created any events yet</Text>
                            ) : (
                                createdEvents.map(event => (
                                    <EventCardSmall key={event.id} event={event} />
                                ))
                            )}
                        </View>
                    </>
                ) : null}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateEvent')}
            >
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 15,
        gap: 10,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeTabButton: {
        backgroundColor: '#38A169',
    },
    tabButtonText: {
        color: '#666',
        fontWeight: '500',
    },
    activeTabButtonText: {
        color: '#fff',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    eventsContainer: {
        gap: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        marginTop: 8,
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
        backgroundColor: '#38A169',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});

export default MyEvents;
