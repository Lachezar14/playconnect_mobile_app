import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'; // Install with `expo install @expo/vector-icons`

const daysOfWeek = [
    { name: 'Mon' },
    { name: 'Tue' },
    { name: 'Wed' },
    { name: 'Thu' },
    { name: 'Fri' },
    { name: 'Sat' },
    { name: 'Sun' },
];

// Helper function to map sports to icons
const getSportIcon = (sport: string) => {
    switch (sport) {
        case 'Football':
            return 'soccer';
        case 'Basketball':
            return 'basketball';
        case 'Padel':
            return 'table-tennis';
        case 'Tennis':
            return 'tennis';
        default:
            return 'yoga';
    }
};

// Rest icon for unselected days
const restIcon = 'weather-night';

interface AvailabilitySelectionProps {
    selectedDays: string[];
    onSelectDays: (days: string[]) => void;
    selectedSport: string;
}

const DayCards: React.FC<AvailabilitySelectionProps> = ({ selectedDays, onSelectDays, selectedSport }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.heading}>When are you free?</Text>
            <Text style={styles.subheading}>
                Tell us which days you are free to enjoy your favorite sports!
            </Text>
            <View style={styles.dayCardContainer}>
                {daysOfWeek.map(({ name }) => (
                    <TouchableOpacity
                        key={name}
                        style={[
                            styles.dayCard,
                            selectedDays.includes(name) && styles.selectedDayCard,
                        ]}
                        onPress={() => {
                            if (selectedDays.includes(name)) {
                                onSelectDays(selectedDays.filter((d) => d !== name));
                            } else {
                                onSelectDays([...selectedDays, name]);
                            }
                        }}
                    >
                        {/* Day Text (Top Left) */}
                        <Text
                            style={[
                                styles.dayText,
                                selectedDays.includes(name) && styles.selectedDayText,
                            ]}
                        >
                            {name}
                        </Text>
                        {/* Icon (Center) */}
                        <MaterialCommunityIcons
                            name={
                                selectedDays.includes(name)
                                    ? getSportIcon(selectedSport)
                                    : restIcon
                            }
                            size={36}
                            color={selectedDays.includes(name) ? 'white' : '#2D3748'}
                            style={styles.dayIcon}
                        />
                        {/* Tick or Empty Circle Icon */}
                        <MaterialIcons
                            name={selectedDays.includes(name) ? 'check-circle' : 'radio-button-unchecked'}
                            size={18}
                            color={selectedDays.includes(name) ? 'white' : '#A0AEC0'}
                            style={styles.tickIcon}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 8,
    },
    subheading: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 50,
    },
    dayCardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        flex: 1, // Ensure the card container uses remaining space
    },
    dayCard: {
        width: '21%',
        aspectRatio: 1 / 3.5,
        borderWidth: 2,
        borderRadius: 16,
        borderColor: '#e8eaec',
        backgroundColor: '#f2f3f4',
        position: 'relative',
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedDayCard: {
        backgroundColor: '#38A169',
        borderColor: '#38A169',
    },
    dayText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2D3748',
        position: 'absolute',
        top: 5,
        left: 8,
    },
    selectedDayText: {
        color: 'white',
    },
    dayIcon: {
        position: 'absolute',
        top: '35%',
    },
    tickIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
    },
});

export default DayCards;
