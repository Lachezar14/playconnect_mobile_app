import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {Platform, View, StyleSheet, Text} from "react-native";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import EventsStack from './stack/EventsStack';
import ProfileStack from './stack/ProfileStack';
import QuickJoinStack from "./stack/QuickJoinStack";
import MyEventsStackScreen from "./stack/MyEventsStack";
import InvitationsStack from "./stack/InvitationsStack";
import CustomTabBar from './CustomTabBar';
import {useEventInvites} from "../context/EventInvitesContext";

const Tab = createBottomTabNavigator();

const tabBarHeight = Platform.select({ ios: 90, android: 70 });
const iconSize = 28;
const activeColor = '#38A169';  // A shade of green
const inactiveColor = '#757575';  // A medium gray
const topSpacing = 2;
const bottomSpacing = Platform.OS === 'ios' ? 28 : 2;  // Extra padding for iOS to account for home indicator
const backgroundColor = 'white';  // Light gray background

const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'INITIAL';
    const hideOnScreens = ['EventDetails', 'CreateEvent'];
    return hideOnScreens.includes(routeName) ? 'none' : 'flex';
};

export default function MainTabNavigator() {
    const { invitationCount } = useEventInvites();

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
                    headerShown: false,  // Remove header control from here
                    tabBarStyle: { display: getTabBarVisibility(route) }
                })}
            />
            <Tab.Screen
                name="EventInvitationsTab"
                component={InvitationsStack}
                options={{
                    title: 'Invitations',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <MaterialCommunityIcons name='inbox-full' size={size} color={color} />
                            {invitationCount > 0 && (
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>{invitationCount}</Text>
                                </View>
                            )}
                        </View>
                    ),
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

const styles = StyleSheet.create({
    badgeContainer: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});