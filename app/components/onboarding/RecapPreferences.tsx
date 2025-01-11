import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const RecapPreferences = ({ selectedSport, selectedSkill, selectedDays}: any) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Review Your Preferences</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Favourite Sport:</Text>
                <Text style={styles.value}>{selectedSport || 'Not selected'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Skill Level:</Text>
                <Text style={styles.value}>{selectedSkill || 'Not selected'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Availability:</Text>
                <Text style={styles.value}>
                    {selectedDays.length > 0 ? selectedDays.join(', ') : 'Not selected'}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F7F8FA',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#4A5568',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A202C',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    editButton: {
        backgroundColor: '#CBD5E0',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flex: 0.45,
    },
    completeButton: {
        backgroundColor: '#38A169',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flex: 0.45,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default RecapPreferences;
