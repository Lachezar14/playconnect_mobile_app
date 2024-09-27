// components/EventCard.tsx
import React from 'react';
import {View, Text, StyleSheet, ImageBackground} from 'react-native';
import { Event } from '../utilities/interfaces';

interface EventCardProps {
    event: Event;
}

const EventCardSwipe: React.FC<EventCardProps> = ({ event }) => {
    // Format the Firestore date into a Date object
    const eventDateTime = new Date(event.date);

    // Format the time and date
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    const formatEventDate = (eventDateTime: Date) => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        // Compare dates
        const isToday = eventDateTime.toDateString() === now.toDateString();
        const isTomorrow = eventDateTime.toDateString() === tomorrow.toDateString();

        if (isToday) {
            return "Today";
        } else if (isTomorrow) {
            return "Tomorrow";
        } else {
            // For other dates, return the formatted date
            return eventDateTime.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'long' });
        }
    };

// Example usage
    const formattedDate = formatEventDate(eventDateTime);

    return (
        <View style={styles.safeArea}>
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'}}
                style={styles.card}
                imageStyle={styles.imageStyle}
            >
                <View style={styles.overlay} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.text}>Sport: {event.sportType}</Text>
                    <Text style={styles.text}>Distance: {event.distance}</Text>
                    <Text style={styles.text}>Date: {formattedTime} / {formattedDate}</Text>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    card: {
        flex: 1,
        marginHorizontal: 5,
        marginBottom: 190,
        borderRadius: 10, // Add border radius for rounded corners
        overflow: 'hidden',
    },
    imageStyle: {
        borderRadius: 10, // Match border radius of the card
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    textContainer: {
        padding: 20,
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 5,
    },
});

export default EventCardSwipe;
