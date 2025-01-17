import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Events from '../../screen/eventFeed/Events';
import EventDetails from '../../screen/eventFeed/EventDetails';
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import EventSection from "../../screen/eventFeed/EventSection";

export type EventStackParamList = {
    Events: undefined;
    EventDetails: { event: any }; // Replace 'any' with a more specific type if available
};

const Stack = createNativeStackNavigator<EventStackParamList>();

export default function EventsStack({navigation, route}: any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "EventDetails" || routeName === "EventSection") {
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            navigation.setOptions({tabBarStyle: {display: 'flex'}});
        }
    }, [navigation, route]);

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Events"
                component={Events}
                options={{ title: 'Events', headerShown: false }}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
            <Stack.Screen
                name="EventSection"
                component={EventSection}
                options={{ title: 'Nothing', headerShown: false }}
            />
        </Stack.Navigator>
    );
}