import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EventsStack from './stack/EventsStack';
import ProfileStack from './stack/ProfileStack';
import { Platform } from "react-native";
import QuickJoinStack from "./stack/QuickJoinStack";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import MyEventsStackScreen from "./stack/MyEventsStack";
import EventInvitations from "../screen/EventInvitations";

const Tab = createBottomTabNavigator();

const tabBarHeight = Platform.select({ ios: 80, android: 60 });

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Events"
            screenOptions={{
                tabBarStyle: {
                    height: tabBarHeight,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10, // Add padding for iOS
                    elevation: 0, // Remove shadow for Android
                },
                tabBarActiveTintColor: 'green',
                tabBarInactiveTintColor: 'gray',
            }}>
            <Tab.Screen
                name="QuickJoinTab"
                component={QuickJoinStack}
                options={{
                    title: 'Quick Join',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="handshake" size={24} color={color} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="EventsTab"
                component={EventsStack}
                options={({ route }) => {
                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Events';
                    return {
                        title: 'Discover',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="compass" size={24} color={color} />
                        ),
                        headerShown: routeName !== 'EventDetails',  // Show header only if not on EventDetails
                    };
                }}
            />
            <Tab.Screen
                name="MyEventsStack"
                component={MyEventsStackScreen}
                options={({ route }) => {
                    const routeName = getFocusedRouteNameFromRoute(route) ?? 'MyEvents';
                    return {
                        title: 'My Events',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="calendar" size={24} color={color} />
                        ),
                        headerShown: routeName === 'MyEvents',  // Show header only if on MyEvents
                        tabBarStyle: routeName === 'CreateEvent' || routeName.includes('Details')
                            ? { display: 'none' }
                            : {}, // Hide tab bar on details and create event screens
                    };
                }}
            />
            <Tab.Screen
                name="EventInvitationsTab"
                component={EventInvitations}
                options={{
                    title: 'Invitations',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name='inbox-full' size={24} color={color} />
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />
                }}
            />
        </Tab.Navigator>
    );
}