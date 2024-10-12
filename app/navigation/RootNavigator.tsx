import React, {useEffect} from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from "../context/AuthContext";
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import {saveUserLocationToFirestore} from "../services/locationService";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
    const { user, isLoading } = useAuth();

    // Check if user is authenticated and
    // check if the user has moved than a 1 kilometer,
    // if they have - update their location in Firestore.
    // This runs every 10 minutes.
    useEffect(() => {
        let locationInterval: NodeJS.Timeout | null = null;

        // Check if user is authenticated
        if (user) {
            // Update location immediately on load
            saveUserLocationToFirestore(user.uid);

            // Set up the interval to update location every 10 minutes
            locationInterval = setInterval(() => {
                saveUserLocationToFirestore(user.uid);
            }, 600000); // 600,000 milliseconds = 10 minutes
        }

        // Clean up the interval when the component unmounts or user logs out
        return () => {
            if (locationInterval) {
                clearInterval(locationInterval);
            }
        };
    }, [user]); // Dependency on 'user', starts when user is authenticated

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