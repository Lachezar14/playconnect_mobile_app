import React from 'react';
import { View, StyleSheet } from 'react-native';
import EventInvitationCard from "../components/event/EventInvitationCard";

const EventInvitations = () => {
    return (
        <View style={styles.container}>
            <EventInvitationCard />
            <EventInvitationCard />
            <EventInvitationCard />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

});

export default EventInvitations;