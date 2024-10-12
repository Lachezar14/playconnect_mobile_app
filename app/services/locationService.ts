import * as Location from 'expo-location';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';
import {calculateDistance} from "../utilities/calcuteDistance";

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export const getUserLocation = async (): Promise<UserLocation | null> => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return null;
        }

        let location = await Location.getCurrentPositionAsync({});
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error("Error getting user location: ", error);
        return null;
    }
};

// Function to check if the user has moved more than 1 kilometer from the stored location
export const isUserLocationFarEnough = async (userId: string, currentLocation: UserLocation): Promise<boolean> => {
    try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId); // Reference to the user document
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const lastLatitude = userData?.latitude;
            const lastLongitude = userData?.longitude;

            // If a previous location exists, calculate the distance
            if (lastLatitude && lastLongitude) {
                const distance = calculateDistance(
                    lastLatitude,
                    lastLongitude,
                    currentLocation.latitude,
                    currentLocation.longitude
                );

                // Return true if the user has moved more than 1 km
                return distance > 1;
            }
        }
        // If no previous location exists, return true (since this would be the first update)
        return true;
    } catch (error) {
        console.error('Error checking user location distance:', error);
        return false;
    }
};

// Function to save user's location in Firestore only if they have moved more than 1 kilometer
export const saveUserLocationToFirestore = async (userId: string): Promise<void> => {
    try {
        const newLocation = await getUserLocation(); // Get the user's current location
        if (!newLocation) {
            console.log('Could not retrieve location');
            return;
        }

        // Check if the user has moved more than 1 kilometer
        const shouldUpdateLocation = await isUserLocationFarEnough(userId, newLocation);

        if (shouldUpdateLocation) {
            const userDocRef = doc(FIRESTORE_DB, 'users', userId); // Reference to the user document
            await updateDoc(userDocRef, {
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                lastUpdated: new Date() // Update the last update timestamp
            });

            console.log('User location saved to Firestore successfully');
        } else {
            console.log('User has not moved more than 1 kilometer, location not updated');
        }
    } catch (error) {
        console.error('Error saving user location to Firestore:', error);
    }
};