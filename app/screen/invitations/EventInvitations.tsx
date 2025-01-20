import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, ScrollView} from 'react-native';
import {useAuth} from "../../context/AuthContext";
import EventInvitationCard from "../../components/event/EventInvitationCard";
import {useEventInvites} from "../../context/EventInvitesContext";
import {SafeAreaView} from "react-native-safe-area-context";

const EventInvitations = () => {
    const { user } = useAuth();
    const { invitations } = useEventInvites();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Invites</Text>
            </View>
            <ScrollView>
                {/* Render the list of event invitations here */}
                {invitations.length === 0 ? (
                    <Text style={styles.emptyText}>No invitations received yet</Text>
                ) : (
                    invitations.map((item, index) => (
                        <View key={item.id}>
                            <EventInvitationCard
                                eventInviteId={item.id}
                                eventId={item.eventId}
                                creatorId={item.eventCreatorId}
                            />
                            {/* Divider after each invitation, except the last one */}
                            {index < invitations.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 15,
        marginHorizontal: 20,
    },
});

export default EventInvitations;
