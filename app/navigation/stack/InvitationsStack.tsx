import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import EventInvitations from "../../screen/invitations/EventInvitations";
import InvitedEventDetails from "../../screen/invitations/InvitedEventDetails";

export type InvitationsStackParamList = {
    EventInvitations: undefined;
    InvitedEventDetails: { event: any }; // Replace 'any' with a more specific type if available
};

const Stack = createNativeStackNavigator<InvitationsStackParamList>();

export default function InvitationsStack({navigation, route}: any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "InvitedEventDetails") {
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
                options={{ title: 'Invitations' }}
            />
            <Stack.Screen
                name="InvitedEventDetails"
                component={InvitedEventDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
        </Stack.Navigator>
    );
}