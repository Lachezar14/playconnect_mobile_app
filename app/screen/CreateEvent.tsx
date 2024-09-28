import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Platform } from 'react-native';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import LocationInput from "../components/LocationInput";
import {Suggestion} from "../utilities/interfaces";
import {createEvent} from "../services/eventService";


const CreateEvent = () => {
    const { user } = useAuth();

    // State to hold event details
    const [title, setTitle] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const [location, setLocation] = useState<Suggestion | null>(null);  // Store the full place object
    const [sportType, setSportType] = useState('');
    const [spots, setSpots] = useState('');
    const [shouldResetLocation, setShouldResetLocation] = useState(false); // State to control reset


    // For displaying the date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Function to save event to Firestore
    const handleCreateEvent = async () => {
        if (!title || !date || !time || !location || !spots) {
            Alert.alert('Please fill out all fields');
            return;
        }

        try {
            await createEvent(
                user?.uid || '',
                title,
                date,
                time,
                location,
                sportType,
                parseInt(spots)
            );

            // Success message
            Alert.alert('Event created successfully!');

            // Clear form inputs
            setTitle('');
            setDate(undefined);
            setTime(undefined);
            setLocation(null);
            setSportType('');
            setSpots('');
            setShouldResetLocation(true);
        } catch (error) {
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
            <LocationInput
                setLocation={setLocation}
                resetQuery={shouldResetLocation}
                setShouldResetLocation={setShouldResetLocation}
            />

            <Text style={styles.label}>Sport</Text>
            <TextInput
                style={styles.input}
                value={sportType}
                onChangeText={setSportType}
                placeholder="Enter the sport"
            />

            <Text style={styles.label}>Available Places</Text>
            <TextInput
                style={styles.input}
                value={spots}
                onChangeText={setSpots}
                placeholder="Enter number of available places"
                keyboardType="numeric"
            />

            <Button title="Create Event" onPress={handleCreateEvent} />
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
