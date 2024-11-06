import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {useAuth} from "../context/AuthContext";
import EventInvitationCard from "../components/event/EventInvitationCard";
import {useEventInvites} from "../context/EventInvitesContext";

const EventInvitations = () => {
    const { user } = useAuth();
    const { invitations } = useEventInvites();

    return (
        <View style={styles.container}>
            <ScrollView>
            {/* Render the list of event invitations here */}
            {invitations.length === 0 ? (
                <Text style={styles.emptyText}>No invitations received yet</Text>
            ) : (
                invitations.map(item => (
                    <EventInvitationCard
                        key={item.id}
                        eventInviteId={item.id}
                        eventId={item.eventId}
                        creatorId={item.eventCreatorId}
                    />
                ))
            )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
});

export default EventInvitations;