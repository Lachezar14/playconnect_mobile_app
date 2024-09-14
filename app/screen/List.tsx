import {Button, Text, View} from "react-native";
import React from "react";
import {NavigationProp} from "@react-navigation/native";
import {FIREBASE_AUTH} from "../../firebaseConfig";



interface RouterProps {
    navigation: NavigationProp<any, any>
}

const List = ({ navigation }: RouterProps) => {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Button title='Go to details' onPress={() => navigation.navigate('Details')}></Button>
            <Button title='Logout' onPress={() => FIREBASE_AUTH.signOut()}></Button>
        </View>
    )
}

export default List;