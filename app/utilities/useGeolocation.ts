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

    useEffect(() => {
        if (userLocation) {
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                eventLatitude,
                eventLongitude
            );
            setDistance(dist);
        }
    }, [userLocation, eventLatitude, eventLongitude]);

    return { userLocation, distance };
};

export default useGeolocation;
