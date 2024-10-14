import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {useAuth} from "../context/AuthContext";
import {fetchEventInvitesByUserId} from "../services/eventInviteService";
import {EventInvite} from "../utilities/interfaces";
import EventInvitationCard from "../components/event/EventInvitationCard";

const EventInvitations = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<EventInvite[]>([]);

    const fetchInvitations = async () => {
        if (!user) return;

        try {
            const invitations = await fetchEventInvitesByUserId(user.uid);
            setInvitations(invitations);
        }
        catch (error) {
            console.error("Error fetching event invitations: ", error);
        }
    }

    useEffect(() => {
        fetchInvitations();
    }, []);

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