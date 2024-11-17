import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../../screen/profile/Profile';
import UserPreferences from "../../screen/profile/UserPreferences";
import {getFocusedRouteNameFromRoute} from "@react-navigation/native";

export type ProfileStackParamList = {
    Profile: undefined;
    EventInvitations: undefined;
    UserPreferences: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack({navigation,route}: any) {
    React.useLayoutEffect(() => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "UserPreferences" || routeName === "EventInvitations") {
            navigation.setOptions({tabBarStyle: {display: 'none'}});
        }else {
            navigation.setOptions({tabBarStyle: {display: 'flex'}});
        }
    }, [navigation, route]);

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Profile"
                component={Profile}
                options={{ title: 'Profile', headerShown: false }}
            />
            <Stack.Screen
                name="UserPreferences"
                // @ts-ignore
                component={UserPreferences} // Add the new screen
                options={{ title: 'Preferences' }} // Optional title
            />
        </Stack.Navigator>
    );
}
