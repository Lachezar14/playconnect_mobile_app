import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screen/Login';
import List from './app/screen/List';
import Details from './app/screen/Details';
import React from 'react';
import {AuthProvider, useAuth} from "./app/context/AuthContext";


const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();

function InsideLayout() {
    return (
        <InsideStack.Navigator>
            <InsideStack.Screen name="My todos" component={List} />
            <InsideStack.Screen name="Details" component={Details} />
        </InsideStack.Navigator>
    );
}

const AuthenticatedApp = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null; // You could return a loading spinner here
    }

    return (
        <Stack.Navigator initialRouteName="Login">
            {user ? (
                <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
            ) : (
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            )}
        </Stack.Navigator>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AuthenticatedApp />
            </NavigationContainer>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
