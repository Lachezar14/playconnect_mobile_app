import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyEvents from '../../screen/MyEvents';
import JoinedEventsDetails from '../../screen/JoinedEventsDetails';

const JoinedEventsStack = createNativeStackNavigator();

export default function JoinedEventsStackScreen() {
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
                options={{
                    title: 'Event Details',

                }}
            />
        </JoinedEventsStack.Navigator>
    );
}
