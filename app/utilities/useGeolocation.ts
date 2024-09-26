import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

interface UserLocation {
    latitude: number;
    longitude: number;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

const useGeolocation = (eventLatitude: number, eventLongitude: number) => {
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [distance, setDistance] = useState<number | null>(null);

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

    // Updated calculateEventDistance to accept parameters
    const calculateEventDistance = (eventLatitude: number, eventLongitude: number) => {
        if (userLocation) {
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                eventLatitude,
                eventLongitude
            );

            // Convert distance to string format
            if (dist < 1) {
                // If distance is less than 1 km, return in meters
                return `${Math.round(dist * 1000)}m`; // Convert to meters and round
            } else {
                // If distance is 1 km or more, return in kilometers
                return `${dist.toFixed(1)}km`; // Format to 1 decimal place
            }
        }
        return "N/A"; // Return "N/A" if userLocation is not available
    };

    // Automatically calculate distance when userLocation updates
    useEffect(() => {
        if (userLocation) {
            setDistance(calculateDistance(userLocation.latitude, userLocation.longitude, eventLatitude, eventLongitude));
        }
    }, [userLocation, eventLatitude, eventLongitude]);

    return { userLocation, distance, calculateEventDistance };
};

export default useGeolocation;

