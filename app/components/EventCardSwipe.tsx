// components/EventCard.tsx
import React from 'react';
import {View, Text, StyleSheet, Dimensions, ImageBackground} from 'react-native';

interface EventCardProps {
    event: {
        title: string;
        sport: string;
        distance: string;
        startTime: string;
    };
}

const { width, height } = Dimensions.get('window');

const EventCardSwipe: React.FC<EventCardProps> = ({ event }) => {
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
                    <Text style={styles.text}>Sport: {event.sport}</Text>
                    <Text style={styles.text}>Distance: {event.distance}</Text>
                    <Text style={styles.text}>Start Time: {event.startTime}</Text>
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
