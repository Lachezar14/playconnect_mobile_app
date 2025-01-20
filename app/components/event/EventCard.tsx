import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Event } from '../../utilities/interfaces';
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";

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

    // Format the Firestore date into a Date object
    const eventDateTime = new Date(event.date);
    const currentDate = new Date();
    const isEventInPast = eventDateTime < currentDate;

    // Format the time and date
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = eventDateTime.toLocaleDateString([], { month: 'long', day: 'numeric' });

    return (
        <TouchableOpacity
            onPress={() => !isEventInPast && navigation.navigate(targetPage, { event })}
            disabled={isEventInPast}
        >
            <View style={[styles.card, isEventInPast && styles.disabledCard]}>
                <Image
                    source={{ uri: event.eventImage }}
                    style={[styles.image, isEventInPast && styles.greyedImage]}
                />
                <View style={styles.cardContent}>
                    <Text style={[styles.title, isEventInPast && styles.greyedText]}>{event.title}</Text>
                    <View style={styles.iconTextRow}>
                        <Feather name="activity" size={16} color={isEventInPast ? '#888' : '#38A169'} />
                        <Text style={[styles.sport, isEventInPast && styles.greyedText]}>
                            {event.sportType}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.iconTextRow}>
                            <Feather name="calendar" size={16} color={isEventInPast ? '#888' : '#38A169'} />
                            <Text style={[styles.time, isEventInPast && styles.greyedText]}>
                                {formattedDate}, {formattedTime}
                            </Text>
                        </View>
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
        marginBottom: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    cardContent: {
        paddingVertical: 8,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    time: {
        fontSize: 14,
        color: '#38A169',
        fontWeight: '500',
        marginLeft: 4,
    },
    distance: {
        fontSize: 14,
        color: '#888',
        fontWeight: '600',
        marginRight: 8,
    },
    sport: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginLeft: 4, // Space between icon and text
    },
    greyedText: {
        color: '#888',
    },
    greyedImage: {
        opacity: 0.5,
    },
    disabledCard: {
        backgroundColor: '#e0e0e0',
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
