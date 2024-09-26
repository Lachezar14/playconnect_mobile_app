import React, {useCallback, useState} from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import {FIRESTORE_DB} from "../../firebaseConfig";
import { collection, getDocs } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import EventCard from "../components/EventCard";
import SearchFilter from "../components/SearchFilter";
import SportFilter from "../components/SportFilter";

// Event type definition
interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    availablePlaces: number;
    sportType: string;
    userId: string;
    latitude: number;
    longitude: number;
}

// Main component to render the list of events
const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sports, setSports] = useState<string[]>([]);

    // Fetch events from Firestore
    const fetchEvents = async () => {
        try {
            const eventsCollection = collection(FIRESTORE_DB, 'events');
            const eventSnapshot = await getDocs(eventsCollection);
            const eventList: Event[] = eventSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Event[];
            setEvents(eventList);
            setFilteredEvents(eventList); // Initialize with full event list

            // Extract unique sports from events
            const uniqueSports = Array.from(new Set(eventList.map(event => event.sportType)));
            setSports(['All', ...uniqueSports]);
        } catch (error) {
            console.error("Error fetching events: ", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEvents();
        }, [])
    );

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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading Events...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SearchFilter onSearch={handleSearch} onFilterApply={handleFilterApply} />
            <SportFilter sports={sports} onSportSelect={handleSportSelect} />
            <FlatList
                data={filteredEvents}
                renderItem={({ item }) => (
                    <EventCard
                        event={item}
                        targetPage="EventDetails"  // Specify the target page for events
                    />
                )}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default Events;

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
