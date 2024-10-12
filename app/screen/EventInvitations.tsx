import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import UserInviteModal from "../modal/UserInviteModal";
import {useAuth} from "../context/AuthContext";

const EventInvitations = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { user } = useAuth();

    const handleInvite = () => {
        // Handle the invite action here (e.g., send an invite to the user)
        console.log(`Inviting user...`);
    };

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    // Example event location and sport (you should replace these with actual event data)
    const event = { id: "ewweewfewffwefw", latitude: 51.450606, longitude: 5.4635542 };
    const eventSport = 'Football';

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={openModal}>
                <Text style={styles.buttonText}>Invite Nearby Users</Text>
            </TouchableOpacity>
            <UserInviteModal
                isVisible={isModalVisible}
                onClose={closeModal}
                event={event}
                eventSport={eventSport}
                currentUserId={user?.uid || ''}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    button: {
        backgroundColor: '#38A169',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default EventInvitations;