import * as Location from 'expo-location';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { calculateDistance } from '../utilities/calcuteDistance';

export interface UserLocation {
    latitude: number;
    longitude: number;
}

// Retry logic for getting user location with permissions
export const getUserLocation = async (maxRetries = 5): Promise<UserLocation | null> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log(`Location permission denied (Attempt ${attempt}/${maxRetries})`);
                if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retrying
                continue;
            }

            // Try to get the location
            const location = await Location.getCurrentPositionAsync({});
            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch (error) {
            console.error(`Error getting location on attempt ${attempt}:`, error);
            if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 3000)); // Retry delay if an error occurs
        }
    }

    console.log('Failed to retrieve location after maximum retries');
    return null;
};

// Function to check if the user has moved more than 1 kilometer from the stored location
export const isUserLocationFarEnough = (lastLocation: UserLocation, currentLocation: UserLocation): boolean => {
    const distance = calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude
    );
    return distance > 1; // More than 1 km
};

// Function to save user's location in Firestore only if they have moved more than 1 kilometer
export const saveUserLocationToFirestore = async (userId: string, currentLocation: UserLocation): Promise<void> => {
    try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const lastLocation: UserLocation = {
                latitude: userData?.latitude,
                longitude: userData?.longitude,
            };

            // If the user has moved more than 1 km, update the location in Firestore
            if (isUserLocationFarEnough(lastLocation, currentLocation)) {
                await updateDoc(userDocRef, {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    lastUpdated: new Date(),
                });
                console.log('User location saved to Firestore');
            } else {
                console.log('User location has not moved significantly, no update needed');
            }
        }
    } catch (error) {
        console.error('Error saving user location to Firestore:', error);
    }
};
