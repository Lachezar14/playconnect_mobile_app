import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import EventsStack from './stack/EventsStack';
import ProfileStack from './stack/ProfileStack';
import QuickJoinStack from "./stack/QuickJoinStack";
import MyEventsStackScreen from "./stack/MyEventsStack";
import InvitationsStack from "./stack/InvitationsStack";
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

const tabBarHeight = Platform.select({ ios: 90, android: 70 });
const iconSize = 24;
const activeColor = '#38A169';  // A shade of green
const inactiveColor = '#757575';  // A medium gray
const topSpacing = 2;
const bottomSpacing = Platform.OS === 'ios' ? 28 : 12;  // Extra padding for iOS to account for home indicator
const backgroundColor = 'white';  // Light gray background

const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'INITIAL';
    const hideOnScreens = ['EventDetails', 'CreateEvent'];
    return hideOnScreens.includes(routeName) ? 'none' : 'flex';
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Events"
            tabBar={(props) => (
                <CustomTabBar
                    {...props}
                    tabBarHeight={tabBarHeight}
                    iconSize={iconSize}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    topSpacing={topSpacing}
                    bottomSpacing={bottomSpacing}
                    backgroundColor={backgroundColor}
                />
            )}
            screenOptions={{
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
            }}>
            <Tab.Screen
                name="QuickJoinTab"
                component={QuickJoinStack}
                options={{
                    title: 'Quick Join',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="handshake" size={size} color={color} />,
                    headerShown: false,
                }}
            />
            <Tab.Screen
                name="EventsTab"
                component={EventsStack}
                options={({ route }) => ({
                    title: 'Discover',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="compass" size={size} color={color} />,
                    headerShown: getFocusedRouteNameFromRoute(route) !== 'EventDetails',
                    tabBarStyle: { display: getTabBarVisibility(route) }
                })}
            />
            <Tab.Screen
                name="MyEventsStack"
                component={MyEventsStackScreen}
                options={({ route }) => ({
                    title: 'My Events',
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar" size={size} color={color} />,
                    headerShown: getFocusedRouteNameFromRoute(route) === 'MyEvents',
                    tabBarStyle: { display: getTabBarVisibility(route) }
                })}
            />
            <Tab.Screen
                name="EventInvitationsTab"
                component={InvitationsStack}
                options={{
                    title: 'Invitations',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name='inbox-full' size={size} color={color} />
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStack}
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} />
                }}
            />
        </Tab.Navigator>
    );
}