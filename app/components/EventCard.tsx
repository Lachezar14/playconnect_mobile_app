import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

// Define the navigation stack types
type RootStackParamList = {
    Events: undefined;
    EventDetails: { event: Event };
    JoinedEventsDetails: { event: Event }; // Define the joined event details page
};

// Define the type for navigation prop
type EventCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;

// Card component to display event details
interface EventCardProps {
    event: Event;
    targetPage: 'EventDetails' | 'JoinedEventsDetails'; // Specify the target page
}

const EventCard: React.FC<EventCardProps> = ({ event, targetPage }) => {
    const navigation = useNavigation<EventCardNavigationProp>();

    // Combine the date and time into a single Date object
    const eventDateTime = new Date(`${event.date}T${event.time}`);

    // Format the time and day
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDay = eventDateTime.toLocaleDateString([], { weekday: 'long' });

    return (
        <TouchableOpacity onPress={() => navigation.navigate(targetPage, { event })}>
            <View style={styles.card}>
                <Image
                    source={{
                        uri: 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                    }} // Replace with dynamic event image URL
                    style={styles.image}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.time}>
                        {formattedTime} / {formattedDay}
                    </Text>
                    <Text style={styles.location}>{event.location}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default EventCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 16,
        overflow: 'hidden',
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
