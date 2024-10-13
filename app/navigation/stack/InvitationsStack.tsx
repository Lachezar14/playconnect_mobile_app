import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import EventDetails from "../../screen/EventDetails";
import EventInvitations from "../../screen/EventInvitations";

export type InvitationsStackParamList = {
    EventInvitations: undefined;
    EventDetails: { event: any }; // Replace 'any' with a more specific type if available
};

const Stack = createNativeStackNavigator<InvitationsStackParamList>();

export default function InvitationsStack({navigation, route}: any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "EventDetails") {
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            navigation.setOptions({tabBarStyle: {display: 'flex'}});
        }
    }, [navigation, route]);

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="EventInvitations"
                component={EventInvitations}
                options={{ title: 'Events', headerShown: false }}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
        </Stack.Navigator>
    );
}