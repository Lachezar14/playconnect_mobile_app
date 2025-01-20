import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {Feather, MaterialCommunityIcons} from "@expo/vector-icons";
import {User, Event} from "../../utilities/interfaces";
import {fetchUserById} from "../../services/userService";
import {fetchEventById} from "../../services/eventService";
import {useNavigation} from "@react-navigation/native";
import {acceptEventInvite, declineEventInvite} from "../../services/eventInviteService";
import {useAuth} from "../../context/AuthContext";
import {useEventInvites} from "../../context/EventInvitesContext";

// Define the types for the props
interface EventInvitationCardProps {
    eventInviteId: string;
    eventId: string;
    creatorId: string;
}

const EventInvitationCard: React.FC<EventInvitationCardProps> = ({ eventInviteId ,eventId, creatorId }) => {
    const { user } = useAuth();
    const { invitations } = useEventInvites(); // Get invitations from context
    const [event, setEvent] = useState<Event | null>(null);
    const [creator, setCreator] = useState<User | null>(null);
    const navigation = useNavigation();

    // Get the current invite from the context instead of fetching it
    const eventInvite = useMemo(() => {
        return invitations.find(invite => invite.id === eventInviteId) || null;
    }, [invitations, eventInviteId]);

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
        // @ts-ignore
        navigation.navigate('InvitedEventDetails', { event, eventInvite });
    };

    const handleNavigateToJoinedEvent = () => {
        // @ts-ignore
        navigation.navigate('MyEventsStack', { screen: 'JoinedEventDetails', params: { event } });
    }

    const handleDecline = async () => {
        try {
            await declineEventInvite(eventInviteId);
        } catch (error) {
            console.error("Error declining event invite: ", error);
        }
    };

    const handleAccept = async () => {
        try {
            await acceptEventInvite(eventInviteId, eventId, user?.uid || '');
        } catch (error) {
            console.error("Error accepting event invite: ", error);
        }
    }

    useEffect(() => {
        fetchEvent();
        fetchCreator();
    }, [eventInviteId ,eventId, creatorId]);

    const formatDate = (date: string) => {
        if (!date) return '';

        const eventDateTime = new Date(date);
        const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const formattedDate = eventDateTime.toLocaleDateString([], { day: 'numeric', month: 'short' });
        return `${formattedDate}, ${formattedTime}`;
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
                    <View>
                        <Text style={styles.inviterName}>
                            {creator?.firstName} {creator?.lastName}
                        </Text>
                        {/* Small grey text below the name */}
                        <Text style={styles.invitedText}>
                            has invited you to
                        </Text>
                    </View>
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
                        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                            <MaterialCommunityIcons name="check" size={20} color="#fff" />
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
                            <MaterialCommunityIcons name="close" size={20} color="#E53E3E" />
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
    invitedText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#666', // Change this to any grey you prefer
        marginTop: 2, // Adjust if necessary to bring it closer
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
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    acceptButton: {
        backgroundColor: '#38A169',
        padding: 10,
        borderRadius: 25,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    declineButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#E53E3E',
        padding: 10,
        borderRadius: 25,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    buttonTextDecline: {
        color: '#E53E3E',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        marginLeft: 8,
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
        top: 2,
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