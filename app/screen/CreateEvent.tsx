import React, { useState } from 'react';
import {View, TextInput, Button, StyleSheet, Text, Alert, ScrollView} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';
import LocationInput from "../components/LocationInput";
import {Suggestion} from "../utilities/interfaces";
import {createEvent} from "../services/eventService";
import {eventJoin} from "../services/eventParticipationService";
import {useNavigation} from "@react-navigation/native";


const CreateEvent = () => {
    const { user } = useAuth();
    const navigation = useNavigation();

    // State to manage the current step
    const [currentStep, setCurrentStep] = useState(1);

    // Event form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const [location, setLocation] = useState<Suggestion | null>(null);
    const [sportType, setSportType] = useState('');
    const [spots, setSpots] = useState('');
    const [shouldResetLocation, setShouldResetLocation] = useState(false);

    // For displaying the date and time pickers
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Function to handle form submission
    const handleCreateEvent = async () => {
        if (!title || !date || !time || !location || !spots) {
            Alert.alert('Please fill out all fields');
            return;
        }

        try {
            // Create the event first
            const eventId = await createEvent(user?.uid || '', title, date, time, location, sportType, parseInt(spots));

            // If event creation is successful, automatically join the creator to the event
            if (eventId) {
                await eventJoin(eventId, user?.uid || '');
                Alert.alert('Event created and you have been automatically signed up!');
            }

            // Reset the form after success
            resetForm();
            // Redirect to the My Events screen
            navigation.goBack();
        } catch (error) {
            console.error('Error during event creation or joining:', error);
            Alert.alert('Error creating event or signing up, please try again.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDate(undefined);
        setTime(undefined);
        setLocation(null);
        setSportType('');
        setSpots('');
        setShouldResetLocation(true);
        setCurrentStep(1);
    };

    // Date and Time picker handlers
    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) setTime(selectedTime);
    };

    // Navigation between steps
    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleCreateEvent();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Render the current step
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View>
                        <Text style={styles.label}>Event Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Enter event title"
                        />
                        <Text style={styles.label}>Event Description</Text>
                        <TextInput
                            style={styles.input}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Enter description"
                        />
                        <Text style={styles.label}>Sport Type</Text>
                        <TextInput
                            style={styles.input}
                            value={sportType}
                            onChangeText={setSportType}
                            placeholder="Enter sport type"
                        />
                        <Text style={styles.label}>Available Spots</Text>
                        <TextInput
                            style={styles.input}
                            value={spots}
                            onChangeText={setSpots}
                            placeholder="Enter number of available spots"
                            keyboardType="numeric"
                        />
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text style={styles.label}>Event Date</Text>
                        <Button title="Pick Date" onPress={() => setShowDatePicker(true)} />
                        {date && <Text style={styles.pickedValue}>Selected Date: {moment(date).format('YYYY-MM-DD')}</Text>}
                        {showDatePicker && (
                            <DateTimePicker
                                value={date || new Date()}
                                mode="date"
                                display="default"
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
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text style={styles.label}>Location</Text>
                        <LocationInput
                            setLocation={setLocation}
                            resetQuery={shouldResetLocation}
                            setShouldResetLocation={setShouldResetLocation}
                        />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            {renderStep()}

            <View style={styles.buttonContainer}>
                {currentStep > 1 && (
                    <Button title="Previous" onPress={prevStep} />
                )}
                <Button title={currentStep === 3 ? 'Submit' : 'Next'} onPress={nextStep} />
            </View>
        </ScrollView>
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
});
