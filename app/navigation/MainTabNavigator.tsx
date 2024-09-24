import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import EventsStack from './stack/EventsStack';
import CreateEvent from '../screen/CreateEvent';
import ProfileStack from './stack/ProfileStack';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator initialRouteName="Events">
            <Tab.Screen
                name="EventsTab"
                component={EventsStack}
                options={{
                    title: 'Events',
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar" size={24} color={color} />
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
                    tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account" size={24} color={color} />
                }}
            />
        </Tab.Navigator>
    );
}