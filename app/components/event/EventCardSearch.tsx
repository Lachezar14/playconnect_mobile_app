import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Event } from '../../utilities/interfaces';

// Define the navigation stack types
type RootStackParamList = {
    Events: undefined;
    EventDetails: { event: Event };
    JoinedEventsDetails: { event: Event };
};

// Define the type for navigation prop
type EventCardSearchNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;

// Card component to display event details
interface EventCardProps {
    event: Event;
    targetPage: 'EventDetails' | 'JoinedEventsDetails';
}

const EventCardSearch: React.FC<EventCardProps> = ({ event, targetPage }) => {
    const navigation = useNavigation<EventCardSearchNavigationProp>();

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
                    <View style={styles.row}>
                        <Text style={[styles.time, isEventInPast && styles.greyedText]}>
                            {formattedDate}, {formattedTime}
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

export default EventCardSearch;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        marginBottom: 16,
        overflow: 'hidden', // Keeps the layout clean
        // No border or shadow
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 8, // Rounded image edges
        marginRight: 16, // Space between image and text
    },
    cardContent: {
        paddingVertical: 8,
        backgroundColor: 'white', // Ensures the content does not overlap the image
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    time: {
        fontSize: 14,
        color: '#38A169',
        fontWeight: '600',
    },
    distance: {
        fontSize: 14,
        color: '#888',
        marginRight: 8,
        fontWeight: '600',
    },
    greyedText: {
        color: '#888',  // Grey text for past events
    },
    greyedImage: {
        opacity: 0.5,  // Grey out the image for past events
    },
    disabledCard: {
        backgroundColor: '#e0e0e0',  // Greyed-out background for past events
    },
});
