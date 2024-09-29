import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl} from 'react-native';
import EventCard from "../components/EventCard";
import SearchFilter from "../components/SearchFilter";
import SportFilter from "../components/SportFilter";
import {addDistanceToEvents, fetchEvents} from "../services/eventService";
import {getUserLocation} from "../services/locationService";
import {Event} from "../utilities/interfaces";

// Main component to render the list of events
const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [sports, setSports] = useState<string[]>([]);

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            const userLocation = await getUserLocation();
            let fetchedEvents = await fetchEvents();

            if (userLocation) {
                fetchedEvents = addDistanceToEvents(fetchedEvents, userLocation.latitude, userLocation.longitude);
            }

            setEvents(fetchedEvents);
            setFilteredEvents(fetchedEvents);

            const uniqueSports = Array.from(new Set(fetchedEvents.map(event => event.sportType)));
            setSports(['All', ...uniqueSports]);
        } catch (error) {
            console.error("Error loading events: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    }, [loadEvents]);

    // Search and Filter Logic
    const handleSearch = (title: string) => {
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(title.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleFilterApply = (startDate: string, endDate: string) => {
        const filtered = events.filter((event) => {
            const eventDate = new Date(event.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const isWithinDateRange =
                (!start || eventDate >= start) &&
                (!end || eventDate <= end);

            //const matchesSport = sport ? event.title.toLowerCase().includes(sport.toLowerCase()) : true;

            return isWithinDateRange;
        });
        setFilteredEvents(filtered);
    };

    const handleSportSelect = (sport: string | null) => {
        if (sport === null) {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter(event =>
                event.sportType.toLowerCase() === sport.toLowerCase()
            );
            setFilteredEvents(filtered);
        }
    };

    // Triggers loading state everytime the page is open, too buggy
    // if (loading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color="#0000ff" />
    //             <Text>Loading Events...</Text>
    //         </View>
    //     );
    // }

    return (
        <View style={styles.container}>
            <SearchFilter onSearch={handleSearch} onFilterApply={handleFilterApply} />
            <SportFilter sports={sports} onSportSelect={handleSportSelect} />
            <FlatList
                data={filteredEvents}
                renderItem={({ item }) => (
                    <EventCard
                        event={item}
                        targetPage="EventDetails"
                    />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
        </View>
    );
};

export default Events;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10, // Increased for Android
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc', // Light gray border
    },
    image: {
        width: '100%',
        height: 150,
    },
    cardContent: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    time: {
        fontSize: 14,
        color: '#38A169', // Greenish text for time
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: '#888', // Light gray for location
    },
});
