import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Feather} from "@expo/vector-icons";
import {User, Event, EventInvite} from "../../utilities/interfaces";
import {fetchUserById} from "../../services/userService";
import {fetchEventById} from "../../services/eventService";
import {useNavigation} from "@react-navigation/native";
import {acceptEventInvite, declineEventInvite, fetchEventInviteById} from "../../services/eventInviteService";
import {useAuth} from "../../context/AuthContext";

// Define the types for the props
interface EventInvitationCardProps {
    eventInviteId: string;
    eventId: string;
    creatorId: string;
}

const EventInvitationCard: React.FC<EventInvitationCardProps> = ({ eventInviteId ,eventId, creatorId }) => {
    const { user } = useAuth();
    const [eventInvite, setEventInvite] = useState<EventInvite | null>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const navigation = useNavigation();

    const fetchEventInvite = async () => {
        if (!eventInviteId) return;

        try {
            const eventInviteData = await fetchEventInviteById(eventInviteId);
            setEventInvite(eventInviteData);
        } catch (error) {
            console.error("Error fetching event invite details: ", error);
        }
    }

    const fetchEvent = async () => {
        if (!eventId) return;

        try {
            const eventData = await fetchEventById(eventId);
            setEvent(eventData);
        } catch (error) {
            console.error("Error fetching event details: ", error);
        }
    };

    const fetchCreator = async () => {
        if (!creatorId) return;

        try {
            const creatorData = await fetchUserById(creatorId);
            setCreator(creatorData);
        } catch (error) {
            console.error("Error fetching creator details: ", error);
        }
    };

    const handleNavigateToEvent = () => {
        navigation.navigate('EventDetails', { event });
    };

    const handleNavigateToJoinedEvent = () => {
        navigation.navigate('MyEventsStack', { screen: 'JoinedEventDetails', params: { event } });
    }

    const handleDecline = async () => {
        try {
            await declineEventInvite(eventInviteId);
            setEventInvite({ ...eventInvite, status: 'declined' });
        } catch (error) {
            console.error("Error declining event invite: ", error);
        }
    };

    const handleAccept = async () => {
        try {
            await acceptEventInvite(eventInviteId, eventId, user?.uid || '');
            setEventInvite({ ...eventInvite, status: 'accepted' });
        } catch (error) {
            console.error("Error accepting event invite: ", error);
        }
    }

    useEffect(() => {
        fetchEventInvite();
        fetchEvent();
        fetchCreator();
    }, [eventInviteId ,eventId, creatorId]);

    const formatDate = (date: string) => {
        if (!date) return '';

        const eventDateTime = new Date(date);
        const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = eventDateTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        return `${formattedTime} / ${formattedDate}`;
    };

    // Utility function to capitalize the first letter of a string
    const capitalizeFirstLetter = (string: string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    // Function to get badge color based on invite status
    const getBadgeStyle = (status: string) => {
        switch (status) {
            case 'accepted':
                return { backgroundColor: '#38A169' }; // Green for accepted
            case 'declined':
                return { backgroundColor: '#E53E3E' }; // Red for declined
            default:
                return { backgroundColor: '#CBD5E0' }; // Grey for pending or others
        }
    };

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity onPress={eventInvite?.status === 'accepted' ? handleNavigateToJoinedEvent : handleNavigateToEvent}>
             {/*Badge for event invite status */}
            <View style={[styles.badge, getBadgeStyle(eventInvite?.status || 'pending')]}>
                <Text style={styles.badgeText}>{capitalizeFirstLetter(eventInvite?.status || 'Pending')}</Text>
            </View>

            {/* Header: Inviter's avatar and name */}
            <View style={styles.inviterContainer}>
                <Image
                    style={styles.profileImage}
                    source={{ uri: creator?.profilePicture }}
                />
                <Text style={styles.inviterName}>{creator?.firstName} {creator?.lastName}</Text>
            </View>

            {/* Main Content: Event image and details */}
            <View style={styles.mainContent}>
                <Image
                    source={{ uri: event?.eventImage }}
                    style={styles.eventImage}
                />

                <View style={styles.infoContainer}>
                    <Text style={styles.eventTitle}>{event?.title}</Text>

                    <View style={styles.row}>
                        <Feather size={20} name="activity" color="#38A169" />
                        <Text style={styles.iconText}>{event?.sportType}</Text>
                    </View>

                    <View style={styles.row}>
                        <Feather size={20} name="calendar" color="#38A169" />
                        <Text style={styles.iconText}>{formatDate(event?.date)}</Text>
                    </View>
                </View>
            </View>

            {/* Conditional Rendering for Buttons based on EventInvite Status */}
            {eventInvite?.status === 'pending' ? (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.viewButton} onPress={handleAccept}>
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                        <Text style={styles.buttonTextDecline}>Decline</Text>
                    </TouchableOpacity>
                </View>
            ) : null }
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    viewButton: {
        backgroundColor: '#38A169',
        padding: 10,
        borderRadius: 25,
        flex: 1,
        marginRight: 8,
    },
    declineButton: {
        backgroundColor: '#F1F4F8',
        padding: 10,
        borderRadius: 25,
        flex: 1,
    },
    myEventsButton: {
        backgroundColor: '#38A169',
        padding: 10,
        borderRadius: 25,
        width: '100%',
        textAlign: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonTextDecline: {
        color: '#605f5f',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    declinedText: {
        color: '#605f5f',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 12,
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 25,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    centerButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
});

export default EventInvitationCard;