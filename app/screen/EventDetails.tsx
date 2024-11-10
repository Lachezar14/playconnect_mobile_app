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
import { useAuth } from '../context/AuthContext';
import {Event, Participant, User, UserStats} from '../utilities/interfaces';
import {eventLeave, eventJoin, checkIfJoined, fetchParticipants} from "../services/eventParticipationService";
import {fetchUserById, fetchUserStats} from "../services/userService";
import {Feather, Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import OpenGoogleMapsButton from "../components/OpenGoogleMapsButton";
import {SafeAreaView} from "react-native-safe-area-context";
import {UserParticipantDetails} from "../components/user/UserParticipantDetails";

const participants2 = [
    { firstName: "Peter", profilePictureUrl: "https://randomuser.me/api/portraits/men/32.jpg", rating: 3.5 },
    { firstName: "John", profilePictureUrl: "https://randomuser.me/api/portraits/men/22.jpg", rating: 4.2 },
    { firstName: "Sarah", profilePictureUrl: "https://randomuser.me/api/portraits/women/45.jpg", rating: 5.0 },
    { firstName: "Emma", profilePictureUrl: "https://randomuser.me/api/portraits/women/32.jpg", rating: 4.7 },
    { firstName: "Chris", profilePictureUrl: "https://randomuser.me/api/portraits/men/64.jpg", rating: 4.3 },
];

// Define the types for the route params
type RootStackParamList = {
    EventDetails: { event: Event }; // Replace 'any' with the appropriate type for event
};

// Define props using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

const EventDetails: React.FC<Props> = ({ route, navigation }) => {
    const { user } = useAuth(); // Get the user object from the AuthContext
    const { event } = route.params; // Get event details passed through navigation
    const [isJoined, setIsJoined] = useState<boolean>(false); // State to track if the user has joined
    const [loading, setLoading] = useState<boolean>(true); // State to track loading
    const [participants, setParticipants] = useState<Participant[]>([]); // For real participant data
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [eventCreator, setEventCreator] = useState<User | null>(null);
    console.log('Event organizer:', eventCreator);
    const [creatorStats, setCreatorStats] = useState<UserStats | null>(null);
    console.log('Event organizer stats:', creatorStats);

    //const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' } | null>(null);


    const availableSpots = event.spots - (event.takenSpots || 0); // Calculate available spots

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

    // Check if the user has joined the event
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

    const handleEventJoin = async () => {
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            await eventJoin(event.id, user.uid);
            setIsJoined(true);
            //setAlert({ show: true, message: 'Successfully joined the event!', type: 'success' });
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
        navigation.navigate('MyEvents');
    };

    useEffect(() => {
        handleCheckIfJoined(); // Check if the user is already registered when the component mounts
        handleFetchParticipants(); // Fetch the participants list
    }, []);

    const eventDateTime = new Date(event.date);
    const formattedTime = eventDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = eventDateTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const onRefresh = async () => {
        setRefreshing(true);
        await handleCheckIfJoined();
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
                        {isJoined && (
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>Joined</Text>
                            </View>
                        )}
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
                        <Text style={styles.organizerTitle}>Participants</Text>

                        {/* Use FlatList to render each participant */}
                        <FlatList
                            data={participants2}
                            keyExtractor={(item) => item.firstName}
                            renderItem={({ item }) => (
                                <View>
                                    <UserParticipantDetails firstName={item.firstName} profilePictureUrl={item.profilePictureUrl} rating={item.rating} />
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
                                source={{ uri: 'https://via.placeholder.com/50' }}
                                style={styles.organizerImage}
                            />
                            <View style={styles.organizerDetails}>
                                <Text style={styles.organizerName}>{eventCreator?.firstName} {eventCreator?.lastName}</Text>
                                <Text style={styles.organizerRating}>User Rating: ⭐ {creatorStats?.userRating}/5</Text>
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
                        {/* Show the available spots warning only if the user has not joined */}
                        {!isJoined && availableSpots === 1 && (
                            <Text style={styles.remainingSpotsFixed}>
                                Only 1 place remaining!
                            </Text>
                        )}
                        <TouchableOpacity
                            style={isJoined ? styles.goToMyEventsButton : styles.joinButton}
                            onPress={isJoined ? handleGoToMyEvents : handleEventJoin}
                        >
                            <View style={styles.buttonContent}>
                                <Text style={styles.buttonText}>
                                    {isJoined ? "Go to My Events" : "Join Event"}
                                </Text>
                                {!isJoined ? null : (
                                    <Feather name="arrow-right" size={20} color="#fff" style={styles.arrowIcon} />
                                )}
                            </View>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            {/*{alert && alert.show && (*/}
            {/*    <View style={styles.alertContainer}>*/}
            {/*        <CustomAlert message={alert.message} type={alert.type} />*/}
            {/*    </View>*/}
            {/*)}*/}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    alertContainer: {
        position: 'absolute',
        top: 70,
        left: 20,
        right: 20,
        zIndex: 1000,
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
    leaveButton: {
        backgroundColor: '#d9534f',
        borderRadius: 25,
        paddingVertical: 15,
        alignItems: 'center',
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
    divider2: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginBottom: 20,
    },
});

export default EventDetails;