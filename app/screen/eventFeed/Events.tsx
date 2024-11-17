import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, StyleSheet, RefreshControl, Animated} from 'react-native';
import EventCard from "../../components/event/EventCard";
import SearchFilter from "../../components/filters/SearchFilter";
import SportFilter from "../../components/filters/SportFilter";
import {addDistanceToEvents, fetchEvents} from "../../services/eventService";
import {getUserLocation} from "../../services/locationService";
import {Event} from "../../utilities/interfaces";

const HEADER_MAX_HEIGHT = 130; // Adjust this value based on your SearchFilter height
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Main component to render the list of events
const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [sports, setSports] = useState<string[]>([]);

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });


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

    const renderEventCard = ({ item }: { item: Event }) => (
        <EventCard
            event={item}
            targetPage="EventDetails"
        />
    );

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
                <SearchFilter onSearch={handleSearch} onFilterApply={handleFilterApply} />
                <SportFilter sports={sports} onSportSelect={handleSportSelect} />
            </Animated.View>
            <Animated.FlatList
                contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT }}
                data={filteredEvents}
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        // Move refresh control to the top of the list
                        progressViewOffset={HEADER_MAX_HEIGHT}
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
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        zIndex: 1,
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
