import React, { useState, useEffect, useRef } from 'react';
import {Modal, View, Text, FlatList, StyleSheet, Animated, Dimensions, TouchableOpacity} from 'react-native';
import {fetchCompatibleUsers, fetchNearbyUsers} from "../services/userService";
import UserInviteCard from "../components/user/UserInviteCard";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {PanGestureHandler, PanGestureHandlerStateChangeEvent, State} from "react-native-gesture-handler";
import {EventInvite, User, Event} from "../utilities/interfaces";
import {addEventInvite, fetchEventInvitesByEventId} from "../services/eventInviteService";
import {useAuth} from "../context/AuthContext";
import {Feather, Ionicons} from "@expo/vector-icons";
import {getDayOfWeek} from "../utilities/getDayOfWeek";

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.9;

// Define the types for the props
interface UserInviteModalProps {
    isVisible: boolean;
    onClose: () => void;
    event: Event // Assuming it's a string, adjust if necessary
    currentUserId: string;  // Assuming it's a string, adjust if necessary
}

const UserInviteModal: React.FC<UserInviteModalProps> = ({ isVisible, onClose, event, currentUserId }) => {
    const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invitedUsers, setInvitedUsers] = useState<{ userId: string; status: string }[]>([]); // Track invited users and their invite status
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const gestureY = useRef(new Animated.Value(0)).current;
    const { user } = useAuth();

    // Function to load nearby users and invited users for the event
    const loadNearbyUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch nearby users
            //const users = await fetchNearbyUsers(event.latitude, event.longitude, event.sportType, currentUserId);
            // Fetch compatible users
            const users = await fetchCompatibleUsers(event.sportType, "Intermediate", getDayOfWeek(event.date), currentUserId);
            setNearbyUsers(users);
            console.log('Nearby users loaded:', users);

            // Fetch existing invites for the event and update invitedUsers state
            const existingInvites = await fetchEventInvitesByEventId(event.id);
            const invitedUserDetails = existingInvites.map(invite => ({ userId: invite.invitedUserId, status: invite.status }));
            setInvitedUsers(invitedUserDetails);
        } catch (err) {
            setError('Failed to load nearby users');
            console.error('Error loading nearby users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle inviting a user
    const handleInvite = async (userId: string) => {
        // Check if invite already exists
        if (invitedUsers.some(user => user.userId === userId)) {
            console.log('User already invited to this event');
            return; // If invite already exists, return early
        }

        try {
            // Create a new event invite
            const newEventInvite: EventInvite = {
                eventId: event.id,
                eventCreatorId: user?.uid || '',
                invitedUserId: userId,
                status: 'pending',
            };
            // Save the invite to the database
            await addEventInvite(newEventInvite);
            // Update the invitedUsers state
            setInvitedUsers((prevInvitedUsers) => [
                ...prevInvitedUsers,
                { userId, status: 'pending' }
            ]);
        } catch (error) {
            console.error('Failed to send invite:', error);
        }
    };

    // Modal open/close animation handling
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: translateY } }],
        { useNativeDriver: false }
    );

    useEffect(() => {
        if (isVisible) {
            loadNearbyUsers(); // Load users and invites when modal is visible
            // Open modal
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            // Close modal when isVisible changes to false
            Animated.timing(translateY, {
                toValue: MODAL_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY } = event.nativeEvent;
            // Check if swiped down enough to close modal
            if (translationY > MODAL_HEIGHT * 0.2) {
                closeModal();
            } else {
                resetModalPosition();
            }
        }
    };

    const closeModal = () => {
        // Close the modal and notify parent
        Animated.timing(translateY, {
            toValue: MODAL_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    const resetModalPosition = () => {
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    };

    const animatedY = Animated.add(translateY, gestureY);

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="none"
            onRequestClose={closeModal}
        >
            <SafeAreaView style={styles.modalContainer}>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                transform: [{ translateY: animatedY }],
                                paddingTop: insets.top,
                                paddingBottom: insets.bottom
                            }
                        ]}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Invite Users</Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                                <Feather name="x" size={20} color="black" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.messageText}>Invite players to join your sport event</Text>
                        {loading ? (
                            <Text style={styles.messageText}>Loading...</Text>
                        ) : error ? (
                            <Text style={styles.messageText}>{error}</Text>
                        ) : nearbyUsers.length > 0 ? (
                            <FlatList
                                data={nearbyUsers}
                                keyExtractor={(item) => item.id ?? ''}
                                renderItem={({ item }) => {
                                    const invite = invitedUsers.find(invite => invite.userId === item.id);
                                    const isInvited = !!invite;
                                    const inviteStatus = invite ? invite.status : null;

                                    return (
                                        <UserInviteCard
                                            profilePicture={item.profilePicture}
                                            firstName={item.firstName}
                                            lastName={item.lastName}
                                            rating={item.userRating}
                                            onInvite={() => handleInvite(item.id)}
                                            invited={isInvited} // Check if the user is already invited
                                            status={inviteStatus} // Pass the status (e.g., pending, accepted)
                                        />
                                    );
                                }}
                            />
                        ) : (
                            <Text style={styles.messageText}>No nearby users found</Text>
                        )}
                    </Animated.View>
                </PanGestureHandler>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: MODAL_HEIGHT,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Space between title and button
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1, // Allow title to take available space
    },
    closeButton: {
        backgroundColor: 'rgba(193,193,193,0.42)',
        borderRadius: 20, // Circular button
        padding: 10,
    },
    messageText: {
        fontSize: 16,
        marginBottom: 20,
        marginLeft: 20,
        color: 'gray',
    },
});

export default UserInviteModal;
