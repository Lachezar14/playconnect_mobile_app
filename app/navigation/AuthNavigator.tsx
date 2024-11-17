import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screen/auth/Login';
import Register from '../screen/auth/Register';
import Onboarding from "../screen/auth/OnboardingScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Onboarding" component={Onboarding} />
        </Stack.Navigator>
    );
}