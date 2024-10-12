import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyEvents from '../../screen/MyEvents';
import JoinedEventsDetails from '../../screen/JoinedEventsDetails';
import React from 'react';
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";
import CreateEvent from "../../screen/CreateEvent";

const MyEventsStack = createNativeStackNavigator();

export default function JoinedEventsStackScreen({navigation,route}: any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "JoinedEventsDetails" || routeName === "CreateEvent") {
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            navigation.setOptions({tabBarStyle: {display: 'flex'}});
        }
    }, [navigation, route]);


    return (
        <MyEventsStack.Navigator>
            <MyEventsStack.Screen
                name="MyEvents"
                component={MyEvents}
                options={{ title: 'My Events', headerShown: false }}
            />
            <MyEventsStack.Screen
                name="JoinedEventsDetails"
                // @ts-ignore
                component={JoinedEventsDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
            <MyEventsStack.Screen
                name="CreateEvent"
                component={CreateEvent}
                options={{ title: 'Create Event'}}
            />
        </MyEventsStack.Navigator>
    );
}
