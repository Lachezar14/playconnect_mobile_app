import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DayCards = ({ selectedDays, onSelectDays }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.heading}>Which days are you available?</Text>
            <Text style={styles.subheading}>
                Select the days you are available to play sports so we can suggest events on those days!
            </Text>
            <View style={styles.dayCardContainer}>
                {daysOfWeek.map((day) => (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.dayCard,
                            selectedDays.includes(day) && styles.selectedDayCard
                        ]}
                        onPress={() => {
                            if (selectedDays.includes(day)) {
                                onSelectDays(selectedDays.filter(d => d !== day));
                            } else {
                                onSelectDays([...selectedDays, day]);
                            }
                        }}
                    >
                        <Text style={styles.dayText}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 8,
    },
    subheading: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 24,
    },
    section: {
        marginTop: 20,
    },
    dayCardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    dayCard: {
        width: '48%',
        height: 70,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#e8eaec',
        backgroundColor: '#f2f3f4',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 12,
    },
    dayText: {
        fontSize: 18,
        color: '#2D3748',
        fontWeight: 'bold',
    },
    selectedDayCard: {
        borderColor: '#38A169',
        backgroundColor: '#F0FFF4',
        borderWidth: 2,
    },
});

export default DayCards;