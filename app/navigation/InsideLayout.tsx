import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Events from '../screen/Events';   // Import from the screen folder
import CreateEvent from "../screen/CreateEvent";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import EventDetails from "../screen/EventDetails";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Profile from "../screen/Profile";
import JoinedEvents from "../screen/JoinedEvents";

// Define the navigation stack types
export type EventStackParamList = {
    Events: undefined;
    EventDetails: { event: any }; // Replace 'any' with a more specific type if available
};

export type ProfileStackParamList = {
    Profile: undefined;
    JoinedEvents: undefined;
};

// Create bottom tab navigator for post-login flow
const Tab = createBottomTabNavigator();
// Create native stack navigators for each section
const EventStack = createNativeStackNavigator<EventStackParamList>();
const ProfileStackk = createNativeStackNavigator<ProfileStackParamList>();

// Stack Navigator for Events
function EventsStack() {
    return (
        <EventStack.Navigator>
            {/* Events screen is the main screen in the stack */}
            <EventStack.Screen
                name="Events"
                component={Events}
                options={{ title: 'Events' }}
            />
            {/* EventDetails screen is not in the tab navigator */}
            <EventStack.Screen
                name="EventDetails"
                component={EventDetails}
                options={{ title: 'Event Details' }}
            />
        </EventStack.Navigator>
    );
}

//Stack Navigator for Profile
function ProfileStack() {
    return (
        <ProfileStackk.Navigator>
            <ProfileStackk.Screen
                name="Profile"
                component={Profile}
                options={{ title: 'Profile' }}
            />
            {/* Add JoinedEvents screen in the Profile Stack */}
            <ProfileStackk.Screen
                name="JoinedEvents"
                component={JoinedEvents}
                options={{ title: 'My Joined Events' }}
            />
        </ProfileStackk.Navigator>
    );
}

// Define the bottom tab navigation for authenticated users
function InsideLayout() {
    return (
        <Tab.Navigator initialRouteName="Events">
            {/* Events Stack */}
            <Tab.Screen
                name="Events"
                component={EventsStack}
                options={{
                    title: 'Events',
                    tabBarIcon: ({ color }) => <MaterialIcons name="event" size={24} color={color} />
                }}
            />
            {/* Create Event */}
            <Tab.Screen
                name="Create Event"
                component={CreateEvent}
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color }) => <MaterialIcons name="add" size={24} color={color} />
                }}
            />
            {/* Profile Stack */}
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />
                }}
            />
        </Tab.Navigator>
    );
}

export default InsideLayout;
