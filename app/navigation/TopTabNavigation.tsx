import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyEvents from "../screen/MyEvents";
import UserCreatedEvents from "../screen/UserCreatedEvents";
import JoinedEventsDetails from "../screen/JoinedEventsDetails";
import JoinedEventsStackScreen from "./stack/JoinedEventsStack";

const Tab = createMaterialTopTabNavigator();

export default function MyTabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="MyEvents"
                component={JoinedEventsStackScreen}
                options={{ title: 'FAVOURITE' }}
            />
            <Tab.Screen
                name="UserCreatedEvents"
                component={UserCreatedEvents}
                options={{ title: 'CREATED' }}
            />
        </Tab.Navigator>
    );
}