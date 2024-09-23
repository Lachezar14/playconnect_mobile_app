import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../../screen/Profile';
import JoinedEvents from '../../screen/JoinedEvents';
import JoinedEventsDetails from '../../screen/JoinedEventsDetails'; // Import the new screen

export type ProfileStackParamList = {
    Profile: undefined;
    JoinedEvents: undefined;
    JoinedEventsDetails: { event: Event }; // Add the new screen type
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Profile"
                component={Profile}
                options={{ title: 'Profile', headerShown: false }}
            />
            <Stack.Screen
                name="JoinedEvents"
                component={JoinedEvents}
                options={{ title: 'Joined Events' }}
            />
            <Stack.Screen
                name="JoinedEventsDetails"
                // @ts-ignore
                component={JoinedEventsDetails} // Add the new screen
                options={{ title: 'Event Details' }} // Optional title
            />
        </Stack.Navigator>
    );
}
