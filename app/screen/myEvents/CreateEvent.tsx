import React, { useState } from 'react';
import {View, TextInput, StyleSheet, Text, Alert, TouchableOpacity} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';
import LocationInput from "../../components/LocationInput";
import {EventInvite, Suggestion} from "../../utilities/interfaces";
import {createEvent, fetchEventById} from "../../services/eventService";
import {eventJoin} from "../../services/eventParticipationService";
import {useNavigation} from "@react-navigation/native";
import UserInviteModal from "../../modal/UserInviteModal";
import {Event} from "../../utilities/interfaces";
import {fetchCompatibleUsers} from "../../services/userService";
import {getDayOfWeek} from "../../utilities/getDayOfWeek";
import {addEventInvite} from "../../services/eventInviteService";
import { Dropdown } from 'react-native-element-dropdown';
import {SafeAreaView} from "react-native-safe-area-context";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const skillLevelOptions = [
    { label: 'Beginner', value: 'Beginner' },
    { label: 'Intermediate', value: 'Intermediate' },
    { label: 'Advanced', value: 'Advanced' },
];

const sportTypeOptions = [
    { label: 'Football', value: 'Football' },
    { label: 'Tennis', value: 'Tennis' },
    { label: 'Padel', value: 'Padel' },
    { label: 'Basketball', value: 'Basketball' },
];

const CreateEvent = () => {
    const { user } = useAuth();
    const navigation = useNavigation();

    // State to manage the current step
    const [currentStep, setCurrentStep] = useState(1);

    // Event form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newEvent, setNewEvent] = useState<Event | null>(null);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [time, setTime] = useState<Date | undefined>(undefined);
    const [location, setLocation] = useState<Suggestion | null>(null);
    const [skillLevel, setSkillLevel] = useState('');
    const [sportType, setSportType] = useState('');
    const [spots, setSpots] = useState('');
    const [shouldResetLocation, setShouldResetLocation] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    // Close the modal and navigate back to the previous screen
    const closeModal = () => {
        setIsModalVisible(false);
        navigation.goBack();
    };

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
            const eventImage = getSportImage(sportType);
            // Step 1: Create the event
            const eventId = await createEvent(user?.uid || '', title, date, time, location, sportType, skillLevel, parseInt(spots), eventImage);

            if (eventId) {
                // Step 2: Join the creator to the event automatically
                await eventJoin(eventId, user?.uid || '');
                Alert.alert('Event created and you have been automatically signed up!');

                // Step 3: Fetch the newly created event details
                const newEvent = await fetchEventById(eventId);

                // Step 4: Automatically invite compatible users
                await inviteCompatibleUsers(newEvent);

                // Reset form after success
                resetForm();
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error during event creation or inviting users:', error);
            Alert.alert('Error creating event or inviting users, please try again.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setDate(undefined);
        setTime(undefined);
        setLocation(null);
        setSportType('');
        setSkillLevel('');
        setSpots('');
        setShouldResetLocation(true);
        setCurrentStep(1);
    };

    // Function to invite compatible users
    const inviteCompatibleUsers = async (event: Event) => {
        try {
            const compatibleUsers = await fetchCompatibleUsers(
                event.sportType,
                event.skillLevel,  // You may adjust this based on other criteria if needed
                getDayOfWeek(event.date),
                user?.uid || ''  // Exclude the event creator
            );

            for (const compatibleUser of compatibleUsers) {
                const newEventInvite: EventInvite = {
                    eventId: event.id,
                    eventCreatorId: user?.uid || '',
                    invitedUserId: compatibleUser.id,
                    status: 'pending',
                };

                // Send the invite
                await addEventInvite(newEventInvite);
            }
            console.log('Invites sent to compatible users');
        } catch (error) {
            console.error('Failed to invite compatible users:', error);
        }
    };

    // Function to map the sport type to an image URL
    const getSportImage = (sportType: string) => {
        switch (sportType.toLowerCase()) {
            case 'tennis':
                return 'https://plus.unsplash.com/premium_photo-1663045882560-3bdd5f71687c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80';
            case 'padel':
                return 'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
            case 'football':
                return 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80';
            case 'basketball':
                return 'https://images.unsplash.com/photo-1559692048-79a3f837883d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1935&q=80';
            default:
                return 'https://plus.unsplash.com/premium_photo-1667935668767-8a75571d73bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
        }
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
        if (currentStep < 4) {
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
        const renderStepHeader = (title, description) => (
            <View style={styles.section}>
                <Text style={styles.heading}>{title}</Text>
                <Text style={styles.subheading}>{description}</Text>
            </View>
        );

        switch (currentStep) {
            case 1:
                return (
                    <View>
                        {renderStepHeader(
                            "Let's name your event!",
                            "Start with the basics - give your event a catchy title and tell people what it's all about."
                        )}
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
                    </View>
                );
            case 2:
                return (
                    <View>
                        {renderStepHeader(
                            "What's your sport?",
                            "Tell us about the activity and who should join - we'll help find the perfect match!"
                        )}
                        <Text style={styles.label}>Sport Type</Text>
                        <Dropdown
                            style={styles.dropdown}
                            data={sportTypeOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Select sport type"
                            value={sportType}
                            onChange={(item) => setSportType(item.value)}
                            containerStyle={styles.dropdownContainer}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                        />
                        <Text style={styles.label}>Skill Level</Text>
                        <Dropdown
                            style={styles.dropdown}
                            data={skillLevelOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Select skill level"
                            value={skillLevel}
                            onChange={(item) => setSkillLevel(item.value)}
                            containerStyle={styles.dropdownContainer}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
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
            case 3:
                return (
                    <View>
                        {renderStepHeader(
                            "When are we playing?",
                            "Pick a date and time that works best for your activity."
                        )}
                        <Text style={styles.label}>Event Date</Text>
                        <TouchableOpacity style={styles.selectButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateButtonText}>{date ? moment(date).format('YYYY-MM-DD') : 'Pick Date'}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date || new Date()}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <Text style={styles.label}>Event Time</Text>
                        <TouchableOpacity style={styles.selectButton} onPress={() => setShowTimePicker(true)}>
                            <Text style={styles.dateButtonText}>{time ? moment(time).format('HH:mm') : 'Pick Time'}</Text>
                        </TouchableOpacity>
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
            case 4:
                return (
                    <View>
                        {renderStepHeader(
                            "Where's the meet-up?",
                            "Help others find your event by setting the location."
                        )}
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
        <SafeAreaView style={styles.container}>
            {/*<View style={styles.header}>*/}
            {/*    <Text style={styles.title}>Create Event</Text>*/}
            {/*    <TouchableOpacity*/}
            {/*        style={styles.closeButton}*/}
            {/*        onPress={() => navigation.goBack()}*/}
            {/*    >*/}
            {/*        <MaterialCommunityIcons name={'close'} size={24} color={'#333'} />*/}
            {/*    </TouchableOpacity>*/}
            {/*</View>*/}
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${(currentStep / 4) * 100}%` }
                    ]}
                />
            </View>
            {renderStep()}

            <View style={styles.buttonContainer}>
                {currentStep === 1 ? (
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                        <Text style={styles.buttonText}>Previous</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                    <Text style={styles.buttonText}>
                        {currentStep === 4 ? 'Submit' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>

            <UserInviteModal
                isVisible={isModalVisible}
                onClose={closeModal}
                event={newEvent as Event}
                currentUserId={user?.uid || ''}
            />
        </SafeAreaView>
    );
};

export default CreateEvent;

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    closeButton: {
        padding: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
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
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#f7f7f7',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        marginBottom: 40,
    },
    backButton: {
        backgroundColor: '#CBD5E0',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 0.45,
    },
    nextButton: {
        backgroundColor: '#38A169',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: 'center',
        flex: 0.45,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#f7f7f7',
    },
    dropdownContainer: {
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: '#333',
    },
    selectButton: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f7f7f7',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    stepHeader: {
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    section: {
        marginTop: 20,
        marginBottom: 24,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 8,
    },
    subheading: {
        fontSize: 16,
        color: '#4A5568',
        lineHeight: 24,
        marginBottom: 20,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#38A169',
    },
});