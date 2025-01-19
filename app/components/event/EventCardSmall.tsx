import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Event } from '../../utilities/interfaces';
import {Feather, Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { isEventLiked, likeEvent, unlikeEvent } from "../../services/userLikedEventsService";

type RootStackParamList = {
    Events: undefined;
    EventDetails: { event: Event };
    JoinedEventDetails: { event: Event };
    CreatedEventDetails: { event: Event };
};

type EventCardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetails'>;

interface EventCardProps {
    event: Event;
}

const EventCardSmall: React.FC<EventCardProps> = ({ event }) => {
    const navigation = useNavigation<EventCardNavigationProp>();
    const [isLiked, setIsLiked] = useState(false);
    const { user } = useAuth();

    const eventDateTime = new Date(event.date);
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = eventDateTime.toLocaleDateString([], { month: 'short', day: 'numeric' });

    useEffect(() => {
        const checkIfLiked = async () => {
            if (user) {
                const liked = await isEventLiked(user.uid, event.id);
                setIsLiked(liked);
            }
        };
        checkIfLiked();
    }, [event.id, user]);

    const handleLikeEvent = async () => {
        if (user) {
            if (isLiked) {
                await unlikeEvent(user.uid, event.id);
                setIsLiked(false);
            } else {
                await likeEvent(user.uid, event.id);
                setIsLiked(true);
            }
        }
    };

    const handleCardPress = () => {
        const destination =
            event.userId === user?.uid
                ? 'CreatedEventDetails'
                : isLiked
                    ? 'EventDetails'
                    : 'JoinedEventDetails';
        navigation.navigate(destination, { event });
    };

    return (
        <TouchableOpacity onPress={handleCardPress} style={styles.card}>
            <Image source={{ uri: event.eventImage }} style={styles.image} />
            <View style={styles.details}>
                <Text style={styles.title} numberOfLines={1}>
                    {event.title}
                </Text>
                <View style={styles.infoRow}>
                    <Feather name="calendar" size={20} color="#38A169" style={styles.icon} />
                    <Text style={styles.infoText}>{formattedDate} / {formattedTime}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default EventCardSmall;

const styles = StyleSheet.create({
    details: {
        flex: 1,
        justifyContent: 'flex-start', // Align content to the top
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        // borderColor: '#fff',
        // borderWidth: 1,
        // borderRadius: 12,
        //padding: 10,
        alignItems: 'flex-start', // Align card content at the top
        // shadowColor: '#000', // Shadow color
        // shadowOffset: { width: 3, height: 3 }, // Shadow offset to the right and bottom
        // shadowOpacity: 0.2, // Shadow opacity
        // shadowRadius: 5, // Shadow blur radius
        // elevation: 6, // Shadow for Android
    },
    image: {
        width: 120,
        height: 70,
        borderRadius: 8, // Rounded image edges
        marginRight: 10, // Space between image and text
    },
    title: {
        fontSize: 22, // Larger title font size
        fontWeight: '500',
        color: '#333',
        marginBottom: 2, // Space below the title
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 4, // Space between icon and text
    },
    infoText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#38A169',
    },
});

