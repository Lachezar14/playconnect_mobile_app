import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {FIREBASE_AUTH} from "../../firebaseConfig";
import { useNavigation, NavigationProp } from '@react-navigation/native';  // Import NavigationProp for typing
import { ProfileStackParamList } from '../navigation/InsideLayout';  // Import the stack param list

// Correctly type the navigation object
type ProfileScreenNavigationProp = NavigationProp<ProfileStackParamList, 'Profile'>;

const Profile = () => {
    const { user } = useAuth(); // Get the current user from AuthContext
    const navigation = useNavigation<ProfileScreenNavigationProp>();  // Type the navigation hook

    return (
        <View style={styles.container}>
            {/* Profile Image */}
            <Image
                style={styles.profileImage}
                source={{ uri: 'https://randomuser.me/api/portraits/men/4.jpg' }} // Example image, replace with actual user image
            />

            {/* Profile Info */}
            <Text style={styles.name}>Andrea Davis</Text>
            <Text style={styles.email}>{user?.email}</Text>

            {/* Action Items */}
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('JoinedEvents')}  // Navigate to JoinedEvents screen
            >
                <MaterialIcons name="event" size={24} color="black" />
                <Text style={styles.menuText}>My Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <Feather name="edit" size={24} color="black" />
                <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="settings-outline" size={24} color="black" />
                <Text style={styles.menuText}>Account Settings</Text>
            </TouchableOpacity>

            {/* Log Out Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={() => FIREBASE_AUTH.signOut()}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        backgroundColor: '#fff',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#6C63FF',
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#5FA67B',
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',
        padding: 16,
        width: '90%',
        borderRadius: 10,
        marginBottom: 12,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 12,
        color: '#000',
    },
    logoutButton: {
        backgroundColor: '#F6F6F6',
        padding: 12,
        width: '90%',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default Profile;
