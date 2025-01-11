import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

// Mapping for day names
const dayNameMapping: { [key: string]: string } = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
};

const shortNameMapping = Object.entries(dayNameMapping).reduce((acc, [shortName, fullName]) => {
    acc[fullName] = shortName;
    return acc;
}, {} as { [key: string]: string });

const daysOfWeek = [
    { shortName: 'Mon', fullName: 'Monday' },
    { shortName: 'Tue', fullName: 'Tuesday' },
    { shortName: 'Wed', fullName: 'Wednesday' },
    { shortName: 'Thu', fullName: 'Thursday' },
    { shortName: 'Fri', fullName: 'Friday' },
    { shortName: 'Sat', fullName: 'Saturday' },
    { shortName: 'Sun', fullName: 'Sunday' },
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
                {daysOfWeek.map(({ shortName, fullName }) => (
                    <TouchableOpacity
                        key={shortName}
                        style={[
                            styles.dayCard,
                            selectedDays.includes(fullName) && styles.selectedDayCard,
                        ]}
                        onPress={() => {
                            if (selectedDays.includes(fullName)) {
                                onSelectDays(selectedDays.filter((day) => day !== fullName));
                            } else {
                                onSelectDays([...selectedDays, fullName]);
                            }
                        }}
                    >
                        {/* Day Text (Top Left) */}
                        <Text
                            style={[
                                styles.dayText,
                                selectedDays.includes(fullName) && styles.selectedDayText,
                            ]}
                        >
                            {shortName}
                        </Text>
                        {/* Icon (Center) */}
                        <MaterialCommunityIcons
                            name={
                                selectedDays.includes(fullName)
                                    ? getSportIcon(selectedSport)
                                    : restIcon
                            }
                            size={36}
                            color={selectedDays.includes(fullName) ? 'white' : '#2D3748'}
                            style={styles.dayIcon}
                        />
                        {/* Tick or Empty Circle Icon */}
                        <MaterialIcons
                            name={
                                selectedDays.includes(fullName)
                                    ? 'check-circle'
                                    : 'radio-button-unchecked'
                            }
                            size={18}
                            color={selectedDays.includes(fullName) ? 'white' : '#A0AEC0'}
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
