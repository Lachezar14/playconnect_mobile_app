import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyEvents from '../../screen/MyEvents';
import JoinedEventsDetails from '../../screen/JoinedEventsDetails';
import React from 'react';
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";

const JoinedEventsStack = createNativeStackNavigator();

export default function JoinedEventsStackScreen({navigation,route}: any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "JoinedEventsDetails") {
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            navigation.setOptions({tabBarStyle: {display: 'flex'}});
        }
    }, [navigation, route]);


    return (
        <JoinedEventsStack.Navigator>
            <JoinedEventsStack.Screen
                name="MyEvents"
                component={MyEvents}
                options={{ title: 'My Events', headerShown: false }}
            />
            <JoinedEventsStack.Screen
                name="JoinedEventsDetails"
                // @ts-ignore
                component={JoinedEventsDetails}
                options={{ title: 'Event Details', headerShown: false }}
            />
        </JoinedEventsStack.Navigator>
    );
}
