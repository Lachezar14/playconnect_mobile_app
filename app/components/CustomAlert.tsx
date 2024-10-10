import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons, but you can replace it with another icon library

type AlertProps = {
    message: string;
    type: 'success' | 'error' | 'info';
};

const CustomAlert: React.FC<AlertProps> = ({ message, type }) => {
    const icon = type === 'success' ? 'checkmark-circle' :
        type === 'error' ? 'close-circle' : 'information-circle';
    const circleColor = type === 'success' ? '#4CAF50' :
        type === 'error' ? '#F44336' : '#2196F3'; // Green for success, red for error, blue for info

    return (
        <View style={styles.container}>
            <View style={[styles.circle, { backgroundColor: circleColor }]}>
                <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 35,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5, // for Android shadow
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    message: {
        fontSize: 17,
        color: '#333',
    },
});

export default CustomAlert;
