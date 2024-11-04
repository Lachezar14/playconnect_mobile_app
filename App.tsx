import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from "./app/context/AuthContext";
import RootNavigator from './app/navigation/RootNavigator';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {EventInvitesProvider} from "./app/context/EventInvitesContext";

export default function App() {
    return (
        <AuthProvider>
            <EventInvitesProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </GestureHandlerRootView>
            </EventInvitesProvider>
        </AuthProvider>
    );
}
