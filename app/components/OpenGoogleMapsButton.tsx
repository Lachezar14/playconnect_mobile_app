import React from 'react';
import {TouchableOpacity, Text, Linking, Alert, StyleSheet, View} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event } from '../utilities/interfaces';

const OpenGoogleMapsButton = ({ event }: { event: Event }) => {
    const openGoogleMaps = () => {
        const address = `${event.street} ${event.streetNumber}, ${event.city}, ${event.postcode}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Google Maps is not available on this device');
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    return (
        <TouchableOpacity style={styles.locationContainer} onPress={openGoogleMaps}>
            <View style={styles.textContainer}>
                <Text style={styles.locationText}>
                    {`${event.street} ${event.streetNumber}, ${event.city}, ${event.postcode}`}
                </Text>
                {/* Place the small "Open in Google Maps" text below the address */}
                <Text style={styles.openInMapsText}>Click to open in Google Maps</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#4A9F89" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 20,
    },
    textContainer: {
        flexDirection: 'column', // Stack the texts vertically inside this container
        flex: 1, // Take up remaining space to allow the icon to stay on the right
    },
    locationText: {
        fontSize: 14,
        color: '#000',
        flex: 1,
    },
    openInMapsText: {
        fontSize: 12, // Smaller font size
        color: '#888', // Gray color
        marginTop: 4, // Adds some space between the address and the link
    },
})

export default OpenGoogleMapsButton;
