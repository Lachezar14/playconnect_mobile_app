import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {Feather, Ionicons} from '@expo/vector-icons'; // Using Ionicons

type AlertProps = {
    message: string;
    type: 'success' | 'error' | 'info';
};

const CustomAlert: React.FC<AlertProps> = ({ message, type }) => {
    const icon = type === 'success' ? 'check' :
        type === 'error' ? 'x' : 'info';
    const circleColor = type === 'success' ? '#22C55E' : // Adjusted to a more vibrant green
        type === 'error' ? '#F44336' : '#2196F3'; // Red for error, blue for info
    const backgroundColor = type === 'success' ? '#F1FAF5' :
        type === 'error' ? '#FDECEA' : '#EAF4FB'; // Light green for success, light red for error, light blue for info

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={[styles.circle, { backgroundColor: circleColor }]}>
                <Feather name={icon} size={28} color="white" />
            </View>
            <View>
                <Text style={styles.message}>{message}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5, // Android shadow
        marginHorizontal: 20,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#16A34A', // Dark green for success title
        marginBottom: 2,
    },
    message: {
        fontWeight: '500',
        fontSize: 17,
        color: '#7e7e7e', // Grey for the message
    },
});

export default CustomAlert;
