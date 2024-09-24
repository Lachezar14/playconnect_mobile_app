import React, {useEffect, useState} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';

// Event type definition
interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    availablePlaces: number;
    userId: string;
    latitude: number;
    longitude: number;
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
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

    // Function to calculate the distance between two sets of coordinates using the Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in kilometers
        return distance;
    };

    // Get the user's current location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    // Calculate distance when the user's location is available
    useEffect(() => {
        if (userLocation) {
            const dist = calculateDistance(userLocation.latitude, userLocation.longitude, event.latitude, event.longitude);
            setDistance(dist);
        }
    }, [userLocation]);

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
                    }}
                    style={styles.image}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.title}>{event.title}</Text>
                    <View style={styles.row}>
                        <Text style={styles.time}>
                            {formattedTime} / {formattedDay}
                        </Text>
                        {distance !== null && (
                            <Text style={styles.distance}>
                                {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(2)}km`}
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
});
