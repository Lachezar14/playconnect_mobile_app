import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl, FlatList,
} from 'react-native';
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import { useAuth } from '../../context/AuthContext';
import {Event, EventInvite, Participant, User} from '../../utilities/interfaces';
import {fetchParticipants} from "../../services/eventParticipationService";
import {fetchUserById} from "../../services/userService";
import {Feather, FontAwesome, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import OpenGoogleMapsButton from "../../components/OpenGoogleMapsButton";
import {SafeAreaView} from "react-native-safe-area-context";
import {UserParticipantDetails} from "../../components/user/UserParticipantDetails";
import {acceptEventInvite} from "../../services/eventInviteService";

// Define the types for the route params
type RootStackParamList = {
    InvitedEventDetails: { event: Event, eventInvite: EventInvite }; // Replace 'any' with the appropriate type for event
};

// Define props using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'InvitedEventDetails'>;

const InvitedEventDetails: React.FC<Props> = ({ route, navigation }) => {
    const { user } = useAuth(); // Get the user object from the AuthContext
    const { event, eventInvite } = route.params;
    const [loading, setLoading] = useState<boolean>(true); // State to track loading
    const [participants, setParticipants] = useState<Participant[]>([]); // For real participant data
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [eventCreator, setEventCreator] = useState<User | null>(null);

    // Fetch event organizer
    useEffect(() => {
        const fetchEventOrganizer = async () => {
            try {
                // Fetch event creator details
                const creatorData = await fetchUserById(event.userId);
                setEventCreator(creatorData);
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

    const handleEventJoin = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            await acceptEventInvite(eventInvite.id, event.id, user?.uid || '');
            // Add a small delay to ensure Firestore has processed the update
            await new Promise(resolve => setTimeout(resolve, 500));
            navigation.goBack();
        } catch (error: Error | any) {
            if (error.message === 'No more places available') {
                Alert.alert('Registration Failed', 'Sorry, there are no more available places for this event.');
            } else {
                console.error('Error joining event: ', error);
                Alert.alert('Error joining event', 'An error occurred while trying to join the event. Please try again later.');
            }
        }
    };

    const handleGoToMyEvents = () => {
        // @ts-ignore
        navigation.navigate('MyEvents', { screen: 'JoinedEventDetails', params: { event } });
    };

    useEffect(() => {
        handleFetchParticipants(); // Fetch the participants list
    }, []);

    const eventDateTime = new Date(event.date);
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = eventDateTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const onRefresh = async () => {
        setRefreshing(true);
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* Back button */}
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
                    onPress={() => navigation.goBack()}>
                    <Ionicons name="share-social" size={24} color="white" />
                </TouchableOpacity>

                {/* Event Image */}
                <Image
                    source={{ uri: event.eventImage }}
                    style={styles.image}
                />

                <View style={styles.detailsContainer}>
                    {/* Event Title and Joined Badge */}
                    <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                    </View>

                    {/* Event Date and Description */}
                    <Text style={styles.eventDate}>{formattedTime} / {formattedDate}</Text>

                    {/* Location, Available Spots, and Sport Type */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="map-marker" size={35} color="#4A9F89" />
                            <Text style={styles.infoText}>{event.distance || '795m'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoItem}>
                            <MaterialCommunityIcons name="arm-flex" size={35} color="#4A9F89" />
                            <Text style={styles.infoText}>{`${event.skillLevel}`}</Text>
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
                        <Text style={styles.organizerTitle}>Participants - {event.takenSpots}/{event.spots}</Text>

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

                </View>
            </ScrollView>

            {/* Fixed Join Event button at the bottom of the screen */}
            <View style={styles.fixedButtonContainer}>
                {loading ? (
                    <View style={styles.skeletonButton}>
                        <Text style={styles.skeletonText}>Loading...</Text>
                    </View>
                ) : (
                    <>
                        {/* Organizer Info */}
                        <View style={styles.inviteContainer}>
                            <Image
                                source={{ uri: eventCreator?.profilePicture }}
                                style={styles.inviterImage}
                            />
                            <View style={styles.inviteTextContainer}>
                                <Text style={styles.inviterName}>
                                    {eventCreator?.firstName} {eventCreator?.lastName}
                                </Text>
                                <Text style={styles.inviteMessage}>
                                    has invited you to join this event.
                                </Text>
                            </View>
                        </View>

                        {/* Accept Invite Button */}
                        <TouchableOpacity
                            style={styles.joinButton}
                            onPress={handleEventJoin}
                        >
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>Accept Invite</Text>
                            </View>
                        </TouchableOpacity>
                    </>
                )}
            </View>
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
        top: 10,    // Adjust based on your screen layout
        left: 5,   // Adjust based on your screen layout
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 30,
        padding: 10,
        zIndex: 100,
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
    scrollView: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 220,
    },
    detailsContainer: {
        padding: 20,
        paddingBottom: 80, // Add extra padding at the bottom to account for the fixed button
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    eventDate: {
        fontSize: 16,
        color: '#4A9F89',
        marginBottom: 10,
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
        marginTop: 10,
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
        marginBottom: 20,
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
    remainingSpotsFixed: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    joinButton: {
        backgroundColor: '#4A9F89',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
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
    divider2: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginBottom: 20,
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
    inviteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    inviterImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    inviteTextContainer: {
        flex: 1,
    },
    inviterName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    inviteMessage: {
        fontSize: 14,
        color: '#666',
    },
});

export default InvitedEventDetails;