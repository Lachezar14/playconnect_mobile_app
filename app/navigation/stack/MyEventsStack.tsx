import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyEvents from '../../screen/myEvents/MyEvents';
import JoinedEventDetails from '../../screen/myEvents/JoinedEventDetails';
import React from 'react';
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import CreateEvent from "../../screen/myEvents/CreateEvent";
import CreatedEventDetails from "../../screen/myEvents/CreatedEventDetails";
import EventDetails from "../../screen/eventFeed/EventDetails";

const MyEventsStack = createNativeStackNavigator();

export default function JoinedEventsStackScreen({ navigation, route } : any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'MyEvents';
        if (routeName === 'JoinedEventDetails' || routeName === 'CreatedEventDetails' || routeName === 'CreateEvent') {
            navigation.setOptions({ tabBarStyle: { display: 'none' } });
        } else {
            navigation.setOptions({ tabBarStyle: { display: 'flex' } });
        }
    }, [navigation, route]);

    // @ts-ignore
    return (
        <MyEventsStack.Navigator>
            <MyEventsStack.Screen
                name="MyEvents"
                component={MyEvents}
                options={{
                    title: 'My Events',
                    headerShown: true  // Change this to true
                }}
            />
            <MyEventsStack.Screen
                name="EventDetails"
                // @ts-ignore
                component={EventDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
            <MyEventsStack.Screen
                name="JoinedEventDetails"
                // @ts-ignore
                component={JoinedEventDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
            <MyEventsStack.Screen
                name="CreatedEventDetails"
                // @ts-ignore
                component={CreatedEventDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
            <MyEventsStack.Screen
                name="CreateEvent"
                component={CreateEvent}
                options={{ title: 'Create Event', headerShown: false }}
            />
        </MyEventsStack.Navigator>
    );
}