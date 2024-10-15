import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {Feather, FontAwesome} from "@expo/vector-icons";

// Define the types for the props
interface UserInviteProps {
    profilePicture: string;
    firstName: string;
    lastName: string;
    rating: number;
    onInvite: () => void;
    invited: boolean;
    status: 'pending' | 'accepted' | 'declined';
}

const UserInviteCard: React.FC<UserInviteProps> = ({ profilePicture, firstName, lastName, rating, onInvite, invited, status }) => {
    // Determine the invite status message and text color
    //const statusMessage = status === 'pending' ? 'Invited' : status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <View style={styles.card}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/4.jpg' }} style={styles.image} />

            <View style={styles.textContainer}>
                <Text style={styles.name}>{`${firstName} ${lastName}`}</Text>
                <View style={styles.ratingContainer}>
                    <FontAwesome name="star" size={18} color="gold" />
                    <Text style={styles.rating}>{rating}</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onInvite}
                style={[styles.inviteButton, invited && styles.invitedButton]}
                disabled={invited}
            >
                <Text style={status === 'accepted' ? styles.acceptedButtonText : status === 'declined' ? styles.declinedButtonText : status === 'pending' ? styles.invitedButtonText : styles.inviteButtonText}>
                    {status === 'accepted' ? 'Accepted' : status === 'declined' ? 'Declined' : status === 'pending' ? 'Invited' : 'Invite'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginVertical: 5,
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 1,
        justifyContent: 'space-between',
        borderColor: '#ddd',
        borderWidth: 1,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    rating: {
        fontSize: 15,
        color: '#555',
        marginLeft: 4,
    },
    inviteButton: {
        backgroundColor: '#38A169',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    invitedButton: {
        backgroundColor: '#fff', // Gray color for invited state
    },
    inviteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    invitedButtonText: {
        color: '#7e7e7e', // Green text on white background when invited
        fontSize: 13,
        fontWeight: 'bold',
    },
    acceptedButtonText: {
        color: '#38A169',
        fontSize: 13,
        fontWeight: 'bold',
    },
    declinedButtonText: {
        color: '#E53E3E',
        fontSize: 13,
        fontWeight: 'bold',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
});

export default UserInviteCard;
