import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screen/Login';
import React from 'react';
import {AuthProvider, useAuth} from "./app/context/AuthContext";
import InsideLayout from "./app/navigation/InsideLayout";
import Register from "./app/screen/Register";

// Create stack navigator for login flow
const Stack = createNativeStackNavigator();

// Define the authentication flow and conditional navigation
const AuthenticatedApp = () => {
    const { user, isLoading } = useAuth();  // Access the user state from AuthContext

    if (isLoading) {
        return null; // Optional: You can show a loading spinner here
    }

    return (
        <Stack.Navigator>
            {user ? (
                // If user is authenticated, show InsideLayout
                <Stack.Screen
                    name="Inside"
                    component={InsideLayout}
                    options={{ headerShown: false }}
                />
            ) : (
                // If user is not authenticated, show the login/signup flow
                <>
                    <Stack.Screen
                        name="Login"
                        component={Login}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={Register}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

// Main App component with AuthProvider
export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AuthenticatedApp />
            </NavigationContainer>
        </AuthProvider>
    );
}
