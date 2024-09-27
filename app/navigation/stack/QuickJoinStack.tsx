import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventDetails from '../../screen/EventDetails';
import QuickJoin from "../../screen/QuickJoin";
import {TouchableOpacity} from "react-native";
import {Feather} from "@expo/vector-icons";

export type QuickJoinStackParamList = {
    QuickJoin: undefined;
    EventDetails: { event: any };
};

const Stack = createNativeStackNavigator<QuickJoinStackParamList>();

export default function QuickJoinStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="QuickJoin"
                component={QuickJoin}
                options={({ navigation }) => ({
                    title: 'Quick Join',
                    headerRight: () => (
                        <TouchableOpacity onPress={() => navigation.setParams({ openModal: true })}>
                            <Feather name={'sliders'} size={24} color={'#333'} style={{ marginRight: 20 }} />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetails}
                options={{ title: 'Event Details' }}
            />
        </Stack.Navigator>
    );
}