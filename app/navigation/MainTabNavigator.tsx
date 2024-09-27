import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import EventsStack from './stack/EventsStack';
import CreateEvent from '../screen/CreateEvent';
import ProfileStack from './stack/ProfileStack';
import { Platform } from "react-native";
import QuickJoinStack from "./stack/QuickJoinStack";

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
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="compass" size={24} color={color} />
                }}
            />
            <Tab.Screen
                name="CreateEventTab"
                component={CreateEvent}
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name={'plus-circle'} size={24} color={color} />
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