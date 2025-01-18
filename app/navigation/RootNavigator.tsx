import React, {useEffect, useState} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from "../context/AuthContext";
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import {getUserLocation, saveUserLocationToFirestore, UserLocation} from "../services/locationService";
import * as Location from 'expo-location';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { user, isLoading } = useAuth();
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

    useEffect(() => {
        let locationWatcher: Location.LocationSubscription | null = null;

        if (user) {
            // Fetch the initial user location
            const fetchInitialLocation = async () => {
                const location = await getUserLocation();
                if (location) {
                    setUserLocation(location);
                    await saveUserLocationToFirestore(user.uid, location); // Initial location save
                }
            };

            fetchInitialLocation(); // Fetch user location when the user is authenticated

            // Watch for real-time location updates
            const startWatchingLocation = async () => {
                locationWatcher = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 30000, // Update every 10 seconds for example
                        distanceInterval: 100, // Update when moving at least 10 meters
                    },
                    async (location) => {
                        const currentLocation = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        };

                        setUserLocation(currentLocation);
                        await saveUserLocationToFirestore(user.uid, currentLocation); // Save to Firestore only if moved
                    }
                );
            };

            startWatchingLocation(); // Start watching the location

            // Cleanup the watcher when the component unmounts or user logs out
            return () => {
                if (locationWatcher) {
                    locationWatcher.remove(); // Stop watching the location when component unmounts
                }
            };
        }
    }, [user]); // Dependency on user, triggers when user changes

    if (isLoading) {
        return null; // Or return a loading component
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="Main" component={MainTabNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
}