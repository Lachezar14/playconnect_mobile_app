import React, {useEffect, useState} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Event } from '../../utilities/interfaces';
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "../../context/AuthContext";
import {isEventLiked, likeEvent, unlikeEvent} from "../../services/userLikedEventsService";

// Define the navigation stack types
type RootStackParamList = {
    Events: undefined;
    EventDetails: { event: Event };
    JoinedEventsDetails: { event: Event };
};

// Define the type for navigation prop
type EventCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;

// Card component to display event details
interface EventCardProps {
    event: Event;
    targetPage: 'EventDetails' | 'JoinedEventsDetails';
}

const EventCard: React.FC<EventCardProps> = ({ event, targetPage }) => {
    const navigation = useNavigation<EventCardNavigationProp>();
    const [isLiked, setIsLiked] = useState(false);
    const { user } = useAuth();

    // Format the Firestore date into a Date object
    const eventDateTime = new Date(event.date);
    const currentDate = new Date();
    const isEventInPast = eventDateTime < currentDate;

    // Format the time and date
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
    const formattedDate = eventDateTime.toLocaleDateString([], { month: 'long', day: 'numeric' });

    useEffect(() => {
        const checkIfLiked = async () => {
            if (user) {
                try {
                    const liked = await isEventLiked(user.uid, event.id);
                    setIsLiked(liked);
                } catch (error) {
                    console.error('Error checking if event is liked:', error);
                }
            }
        };
        checkIfLiked();
    }, [event.id, user]);

    const handleLikeEvent = async () => {
        if (user) {
            try {
                if (isLiked) {
                    // Unlike the event
                    await unlikeEvent(user.uid, event.id); // Pass event id or doc ID
                    setIsLiked(false);
                } else {
                    // Like the event
                    await likeEvent(user.uid, event.id);
                    setIsLiked(true);
                }
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        }
    };

    return (
        <TouchableOpacity
            onPress={() => !isEventInPast && navigation.navigate(targetPage, { event })}
            disabled={isEventInPast}
        >
            <View style={[styles.card, isEventInPast && styles.disabledCard]}>
                <Image
                    source={{ uri: event.eventImage}}
                    style={[styles.image, isEventInPast && styles.greyedImage]}
                />
                {/* Icon button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={handleLikeEvent}
                >
                    <Ionicons
                        name="heart"
                        size={24}
                        color={isLiked ? 'red' : 'gray'}
                    />
                </TouchableOpacity>
                <View style={styles.cardContent}>
                    <Text style={[styles.title, isEventInPast && styles.greyedText]}>{event.title}</Text>
                    <View style={styles.row}>
                        <Text style={[styles.time, isEventInPast && styles.greyedText]}>
                            {formattedTime} / {formattedDate}
                        </Text>
                        {event.distance && (
                            <Text style={[styles.distance, isEventInPast && styles.greyedText]}>
                                {event.distance}
                            </Text>
                        )}
                    </View>
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
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
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
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    time: {
        fontSize: 14,
        color: '#38A169',
    },
    distance: {
        fontSize: 14,
        color: '#888',
    },
    greyedText: {
        color: '#888',  // Grey text for past events
    },
    greyedImage: {
        opacity: 0.5,  // Makes the image greyed-out
    },
    disabledCard: {
        backgroundColor: '#e0e0e0',  // Greyed-out background for past events
    },
    iconButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'transparent',
    },
});
