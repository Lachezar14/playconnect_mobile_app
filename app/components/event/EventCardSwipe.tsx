// components/EventCard.tsx
import React from 'react';
import {View, Text, StyleSheet, ImageBackground, Dimensions, Platform, TouchableOpacity} from 'react-native';
import { Event } from '../../utilities/interfaces';
import {SafeAreaView} from "react-native-safe-area-context";
import {Feather} from "@expo/vector-icons";

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
            return eventDateTime.toLocaleDateString([], { month: 'short', day: 'numeric'});
        }
    };

    const getSportImage = (sport: string) => {
        switch (sport.toLowerCase()) {
            case 'tennis':
                return 'https://plus.unsplash.com/premium_photo-1663045882560-3bdd5f71687c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80';
            case 'padel':
                return 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
            case 'football':
                return 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80';
            case 'basketball':
                return 'https://images.unsplash.com/photo-1559692048-79a3f837883d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80';
            default:
                return 'https://plus.unsplash.com/premium_photo-1667935668767-8a75571d73bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
        }
    };

    // Example usage
    const formattedDate = formatEventDate(eventDateTime);

    return (
        <View style={styles.cardContainer}>
            <ImageBackground
                source={{ uri: getSportImage(event.sportType) }}
                style={styles.card}
                imageStyle={styles.imageStyle}
            >
                <View style={styles.overlay} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{event.title}</Text>
                    <View style={styles.infoRow}>
                        <Feather name="activity" size={24} color="#fff" />
                        <Text style={styles.iconText}>{event.sportType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Feather name="map-pin" size={24} color="#fff" />
                        <Text style={styles.iconText}>{event.distance}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Feather name="calendar" size={24} color="#fff" />
                        <Text style={styles.iconText}>{formattedDate}, {formattedTime}</Text>
                    </View>
                </View>
                <View style={styles.moreInfoButton}>
                    <Feather name="chevron-up" size={24} color="#fff" />
                    <Text style={styles.moreInfoText}>More Info</Text>
                </View>
            </ImageBackground>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    cardContainer: {
        ...Platform.select({
            ios: {
                width: width - 10,
                height: height * 0.78,
                alignSelf: 'center',
            },
            android: {
                width: width - 10,
                height: height * 0.83, // Slightly smaller for Android
                alignSelf: 'center',
            },
        }),
    },
    card: {
        flex: 1,
        borderRadius: 8,
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
        bottom: 60,
        left: 20,
        right: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    text: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 5,
    },
    moreInfoButton: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    moreInfoText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconText: {
        fontSize: 18,
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
});

export default EventCardSwipe;