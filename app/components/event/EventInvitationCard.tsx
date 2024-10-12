import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";

const EventInvitationCard = () => {
    return (
        <View style={styles.cardContainer}>
            {/* Header: Inviter's avatar and name */}
            <View style={styles.inviterContainer}>
                <Image
                    style={styles.profileImage}
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                />
                <Text style={styles.inviterName}>Alex Johnson</Text>
                <Text style={styles.inviteText}>invited you to:</Text>
            </View>

            {/* Main Content: Event image and details */}
            <View style={styles.mainContent}>
                {/* Event Image */}
                <Image
                    source={{ uri: 'https://plus.unsplash.com/premium_photo-1663045882560-3bdd5f71687c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1976&q=80' }}
                    style={styles.eventImage}
                />

                {/* Event Details */}
                <View style={styles.infoContainer}>
                    <Text style={styles.eventTitle}>Summer Soccer Tournament</Text>

                    <View style={styles.row}>
                        <Feather size={20} name="activity" type="font-awesome" color="#38A169" />
                        <Text style={styles.iconText}>Soccer</Text>
                    </View>

                    <View style={styles.row}>
                        <Feather size={20} name="calendar" type="font-awesome" color="#38A169" />
                        <Text style={styles.iconText}>July 15, 2023</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginTop: 12,
        marginHorizontal: 10,
    },
    inviterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inviterName: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#38A169',
    },
    inviteText: {
        marginLeft: 4,
        fontSize: 16,
        color: '#8a8a8a',
    },
    mainContent: {
        flexDirection: 'row',
    },
    eventImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    iconText: {
        marginLeft: 8,
        color: '#333',
        fontSize: 15,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#6C63FF',
    },
});

export default EventInvitationCard;