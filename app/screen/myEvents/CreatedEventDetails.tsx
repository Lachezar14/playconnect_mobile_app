import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, FlatList} from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from '../../context/AuthContext';
import {User, Event, Participant, UserStats} from '../../utilities/interfaces';
import {
    checkIfCheckedIn,
    checkIfJoined,
    fetchParticipants,
    updateCheckInStatus
} from "../../services/eventParticipationService";
import {Feather, FontAwesome, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import OpenGoogleMapsButton from "../../components/OpenGoogleMapsButton";
import {fetchUserById, fetchUserStats} from "../../services/userService";
import {SafeAreaView} from "react-native-safe-area-context";
import UserInviteModal from "../../modal/UserInviteModal";
import {deleteEventById} from "../../services/eventService";
import {UserParticipantDetails} from "../../components/user/UserParticipantDetails";

// Define the types for the route params
type RootStackParamList = {
    JoinedEventsDetails: { event: Event };
};

// Define props using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'JoinedEventsDetails'>;

const CreatedEventDetails: React.FC<Props> = ({ route, navigation }) => {
    const { user } = useAuth();
    const { event } = route.params;
    const [isJoined, setIsJoined] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [checkedIn, setCheckedIn] = useState<boolean>(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [eventCreator, setEventCreator] = useState<User | null>(null);
    const [creatorStats, setCreatorStats] = useState<UserStats | null>(null);

    const [isLeavingEvent, setIsLeavingEvent] = useState(false);

    const openModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    // Fetch event organizer
    useEffect(() => {
        const fetchEventOrganizer = async () => {
            try {
                // Fetch event creator details
                const creatorData = await fetchUserById(event.userId);
                setEventCreator(creatorData);

                // Fetch event creator stats
                if (creatorData) {
                    const creatorStatsData = await fetchUserStats(event.userId);
                    setCreatorStats(creatorStatsData);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching event details:', error);
                setLoading(false);
            }
        };

        fetchEventOrganizer();
    }, [event.id, event.userId]);

    // Fetch participants and their user details
    const handleFetchParticipants = async () => {
        if (!event.id) {
            console.error('Event ID is undefined');
            return;
        }

        try {
            const participantList = await fetchParticipants(event.id); // Use the service here
            setParticipants(participantList); // Set the fetched participants in state
            console.log('Participants: ', participantList);
        } catch (error) {
            console.error('Error fetching participants: ', error);
            Alert.alert('Error fetching participants', 'Please try again later.');
        }
    };

    const handleCheckIfJoined = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            setLoading(false);
            return;
        }

        try {
            const userIsJoined = await checkIfJoined(event.id, user.uid); // Use the service function
            setIsJoined(userIsJoined); // Set isJoined based on the returned value
        } catch (error) {
            console.error('Error checking participation:', error);
        } finally {
            setLoading(false); // Set loading to false once the check is done
        }
    };

    // Unregister the user from the event
    const handleEventDelete = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            await deleteEventById(event.id);
            setIsJoined(false);
            setIsLeavingEvent(false);
            navigation.goBack();
        } catch (error) {
            console.error('Error leaving event: ', error);
            Alert.alert('Error leaving event, please try again');
        }
    };

    const handleCheckIn = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return
        }

        if (checkedIn) {
            Alert.alert('Already Checked In', 'You have already checked in for this event.');
            return;
        }

        if (!isCheckInEnabled()) {
            const eventStartDateTime = new Date(event.date);
            const timeUntilCheckIn = eventStartDateTime.getTime() - Date.now() - 15 * 60 * 1000;
            const minutesUntilCheckIn = Math.ceil(timeUntilCheckIn / (60 * 1000));

            Alert.alert(
                'Check-in Not Available',
                `Check-in opens 15 minutes before the event starts. Please try again in ${minutesUntilCheckIn} minutes.`
            );
            return;
        }

        try {
            // Update the check-in status using the service method
            await updateCheckInStatus(event.id, user?.uid);

            setCheckedIn(true); // Set local state
            Alert.alert('Success', 'You have successfully checked in!');
        } catch (error) {
            console.error('Error checking in:', error);
            Alert.alert('Error checking in', 'Please try again later.');
        }
    };

    const isCheckInEnabled = () => {
        const eventStartDateTime = new Date(event.date);
        const currentDateTime = new Date();
        const timeDifference = eventStartDateTime.getTime() - currentDateTime.getTime();
        return timeDifference <= 15 * 60 * 1000 && timeDifference >= 0; // Check if within 15 minutes before the event
    };

    const handleCheckIfCheckedIn = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            const isCheckedIn = await checkIfCheckedIn(event.id, user?.uid);
            setCheckedIn(isCheckedIn); // Set local state based on service result
        } catch (error) {
            console.error('Error checking check-in status:', error);
        }
    };

    useEffect(() => {
        handleCheckIfJoined();
        handleFetchParticipants();
        handleCheckIfCheckedIn();
    }, []);

    const eventDateTime = new Date(event.date);
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = eventDateTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                {/* Like Button */}
                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="heart" size={24} color="white" />
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={openModal}
                >
                    <Feather name="send" size={24} color="white" />
                </TouchableOpacity>

                <Image
                    source={{ uri: event.eventImage }}
                    style={styles.image}
                />

                <View style={styles.detailsContainer}>
                    {/* Event Title and Joined Badge */}
                    <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        {isJoined && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>Created</Text>
                            </View>
                        )}
                    </View>

                    {/* Event Date */}
                    <Text style={styles.eventDate}>{formattedTime} / {formattedDate}</Text>

                    {/* Location, Available Spots, and Sport Type */}
                    <View style={styles.infoContainer}>
                        {checkedIn ? (
                            <View style={styles.infoItem}>
                                <Feather name="check-circle" size={35} color="#4A9F89" />
                                <Text style={styles.infoText}>Checked-In</Text>
                            </View>
                        ) : (
                            <View style={styles.infoItem}>
                                <Feather name="loader" size={35} color="#666" />
                                <Text style={styles.infoText}>Pending Check-In</Text>
                            </View>
                        )}
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker" size={35} color="#4A9F89" />
                            <Text style={styles.infoText}>{event.distance || '795m'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <Feather name={'activity'} size={35} color="#4A9F89" />
                            <Text style={styles.infoText}>{event.sportType}</Text>
                        </View>
                    </View>

                    {/* Address and button to open in Google Maps */}
                    <OpenGoogleMapsButton event={event} />

                    {/* More Info Section */}
                    <View style={styles.organizerContainer}>
                        <Text style={styles.organizerTitle}>More Info</Text>
                        <Text style={styles.eventDescription}>
                            Are you a padel enthusiast? Do you want to play but don't have a buddy? Fear not!
                            Come to the SportsCentrum Arena and take part in one of the best padel tournaments.
                        </Text>
                    </View>

                    {/* Simple Divider */}
                    <View style={styles.divider2} />

                    {/* Participants Section */}
                    <View style={styles.organizerContainer}>
                        <Text style={styles.organizerTitle}>Participants</Text>

                        {/* Use FlatList to render each participant */}
                        <FlatList
                            data={participants}
                            keyExtractor={(item) => item.firstName}
                            renderItem={({ item }) => (
                                <View>
                                    <UserParticipantDetails firstName={item.firstName} rating={item.userRating} profilePicture={item.profilePicture} />
                                </View>
                            )}
                            horizontal={true} // For a horizontal list
                            showsHorizontalScrollIndicator={false}
                        />
                    </View>

                    {/* Simple Divider */}
                    <View style={styles.divider2} />

                    {/* Organizer Details */}
                    <View style={styles.organizerContainer}>
                        <Text style={styles.organizerTitle}>Organizer</Text>
                        <View style={styles.organizerInfo}>
                            <Image
                                source={{ uri: eventCreator?.profilePicture }}
                                style={styles.organizerImage}
                            />
                            <View style={styles.organizerDetails}>
                                <Text style={styles.organizerName}>{eventCreator?.firstName} {eventCreator?.lastName}</Text>
                                <View style={styles.ratingContainer}>
                                    <FontAwesome name="star" size={16} color="gold" />
                                    <Text style={styles.rating}>{eventCreator?.userRating}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Delete Event Section */}
                    {isJoined && (
                        <View style={styles.leaveEventContainer}>
                            <Text style={styles.sectionTitle}>Delete Event</Text>
                            <Text style={styles.warningText}>
                                If you decide to delete this event, it will be removed from the system forever and this cannot be undone.
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.leaveButton,
                                    isLeavingEvent ? styles.leaveButtonPressed : styles.leaveButtonNormal
                                ]}
                                onPress={() => {
                                    setIsLeavingEvent(true);
                                    Alert.alert(
                                        "Delete Event",
                                        "Are you sure you want to delete this event?",
                                        [
                                            {
                                                text: "Cancel",
                                                onPress: () => setIsLeavingEvent(false),
                                                style: "cancel"
                                            },
                                            {
                                                text: "Yes, Delete",
                                                onPress: handleEventDelete
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Text style={[
                                    styles.leaveButtonText,
                                    isLeavingEvent ? styles.leaveButtonTextPressed : styles.leaveButtonTextNormal
                                ]}>
                                    Delete Event
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed Check In button at the bottom of the screen */}
            <View style={styles.fixedButtonContainer}>
                {loading ? (
                    <View style={styles.skeletonButton}>
                        <Text style={styles.skeletonText}>Loading...</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.checkInButton, (!isJoined || checkedIn) && styles.disabledButton]}
                        onPress={handleCheckIn}
                        disabled={!isJoined || checkedIn}
                    >
                        <Text style={styles.buttonText}>
                            {checkedIn ? "Checked In" : "Check In"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Invite User Modal */}
            <UserInviteModal
                isVisible={isModalVisible}
                onClose={closeModal}
                event={event}
                currentUserId={user?.uid || ''}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // White with 50% opacity
        borderRadius: 30,
        padding: 10,
        zIndex: 100,
    },
    scrollView: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 220,
    },
    detailsContainer: {
        padding: 20,
        paddingBottom: 50, // Add extra padding at the bottom to account for the fixed button
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    eventDate: {
        fontSize: 17,
        color: '#4A9F89',
        marginBottom: 20,
    },
    eventDescription: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoText: {
        marginTop: 5,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: '#E0E0E0',
    },
    locationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        marginBottom: 20,
    },
    locationText: {
        fontSize: 14,
        color: '#000',
        flex: 1,
    },
    organizerContainer: {
    },
    organizerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    organizerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    organizerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    organizerDetails: {
        flex: 1,
    },
    organizerName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    organizerRating: {
        fontSize: 14,
        color: '#666',
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    checkInReminder: {
        color: 'gray',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    goToMyEventsButton: {
        backgroundColor: '#5cbbcf', // Gray color for the button
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrowIcon: {
        marginLeft: 10, // Adds space between the text and the arrow icon
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    skeletonButton: {
        backgroundColor: '#E0E0E0', // light gray for the skeleton
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // make it full width like the original button
    },
    skeletonText: {
        color: '#B0B0B0', // darker gray text for skeleton loading
        fontSize: 18,
        fontWeight: 'bold',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    badgeContainer: {
        backgroundColor: '#4A9F89', // green color for the badge
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff', // white text for better contrast
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkInButton: {
        backgroundColor: '#4A9F89',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#A0A0A0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    leaveEventContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 20,
        marginBottom: 50,
    },
    warningText: {
        fontSize: 15,
        color: '#666',
        marginBottom: 15,
    },
    leaveButton: {
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 2,
    },
    leaveButtonNormal: {
        backgroundColor: 'white',
        borderColor: '#d9534f',
    },
    leaveButtonPressed: {
        backgroundColor: '#d9534f',
        borderColor: '#d9534f',
    },
    leaveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    leaveButtonTextNormal: {
        color: '#d9534f',
    },
    leaveButtonTextPressed: {
        color: 'white',
    },
    divider2: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginBottom: 20,
    },
    likeButton: {
        position: 'absolute',
        top: 10,    // Adjust based on your screen layout
        right: 55,   // Adjust based on your screen layout
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        padding: 10,
        zIndex: 100,
    },
    shareButton: {
        position: 'absolute',
        top: 10,    // Adjust based on your screen layout
        right: 5,   // Adjust based on your screen layout
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        padding: 10,
        zIndex: 100,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    rating: {
        marginLeft: 4,
        fontSize: 15,
        color: "#555",
    },
});

export default CreatedEventDetails;
