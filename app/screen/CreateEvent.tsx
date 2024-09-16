import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Platform } from 'react-native';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

// Event type definition
interface Event {
    title: string;
    date: string;
    time: string;
    location: string;
    availablePlaces: number;
    userId: string;
}

const CreateEvent = () => {
    const { user } = useAuth();

    // State to hold event details
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const [location, setLocation] = useState('');
    const [spots, setSpots] = useState('');

    // For displaying the date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Function to save event to Firestore
    const createEvent = async () => {
        if (!title || !date || !time || !location || !spots) {
            Alert.alert('Please fill out all fields');
            return;
        }

        // Format the date and time as strings
        const formattedDate = moment(date).format('YYYY-MM-DD');
        const formattedTime = moment(time).format('HH:mm');

        try {
            // Add new event to Firestore
            const eventCollection = collection(FIRESTORE_DB, 'events');
            await addDoc(eventCollection, {
                userId: user?.uid,
                title,
                date: formattedDate,
                time: formattedTime,
                location,
                spots: parseInt(spots),
                takenSpots: 0,
            });

            // Success message
            Alert.alert('Event created successfully!');

            // Clear form inputs after successful event creation
            setTitle('');
            setDate(undefined);
            setTime(undefined);
            setLocation('');
            setSpots('');
        } catch (error) {
            console.error('Error adding event: ', error);
            Alert.alert('Error creating event, please try again');
        }
    };

    // Date and Time picker change handlers
    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter event title"
            />

            <Text style={styles.label}>Event Date</Text>
            <Button title="Pick Date" onPress={() => setShowDatePicker(true)} />
            {date && <Text style={styles.pickedValue}>Selected Date: {moment(date).format('YYYY-MM-DD')}</Text>}
            {showDatePicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                />
            )}

            <Text style={styles.label}>Event Time</Text>
            <Button title="Pick Time" onPress={() => setShowTimePicker(true)} />
            {time && <Text style={styles.pickedValue}>Selected Time: {moment(time).format('HH:mm')}</Text>}
            {showTimePicker && (
                <DateTimePicker
                    value={time || new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                />
            )}

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter event location"
            />

            <Text style={styles.label}>Available Places</Text>
            <TextInput
                style={styles.input}
                value={spots}
                onChangeText={setSpots}
                placeholder="Enter number of available places"
                keyboardType="numeric"
            />

            <Button title="Create Event" onPress={createEvent} />
        </View>
    );
};

export default CreateEvent;

const styles = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    pickedValue: {
        fontSize: 16,
        marginVertical: 8,
        color: '#333',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        backgroundColor: '#fff',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        color: '#333',
    },
    button: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#EFF6FF',
        marginBottom: 16,
    },
    buttonText: {
        color: '#1D4ED8',
        fontSize: 16,
    },
    submitButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#1D4ED8',
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
