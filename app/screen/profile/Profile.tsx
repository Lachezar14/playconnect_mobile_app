import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons} from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {FIREBASE_AUTH, FIRESTORE_DB} from "../../../firebaseConfig";
import { useNavigation, NavigationProp } from '@react-navigation/native';  // Import NavigationProp for typing
import { ProfileStackParamList } from '../../navigation/stack/ProfileStack';
import { doc, getDoc} from "firebase/firestore";
import {User} from "../../utilities/interfaces";

// Correctly type the navigation object
type ProfileScreenNavigationProp = NavigationProp<ProfileStackParamList, 'Profile'>;

const Profile = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { user } = useAuth(); // Get the current user from AuthContext
    const [userData, setUserData] = useState<User | null>(null);
    //const [userRating, setUserRating] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUserData = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const userDocRef = doc(FIRESTORE_DB, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                setUserData(userDocSnap.data() as User);
            } else {
                console.log('No user data found');
                setUserData(null);
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [user]); // Fetch user data when the user changes

    const renderStars = (rating: number | null) => {
        const totalStars = 5;
        const filledStars = rating ? Math.floor(rating) : 0;
        const halfStar = rating && rating % 1 !== 0; // Check for half stars
        const emptyStars = totalStars - filledStars - (halfStar ? 1 : 0);

        return (
            <View style={styles.starsContainer}>
                {/* Filled Stars */}
                {Array(filledStars).fill(null).map((_, index) => (
                    <MaterialCommunityIcons name={'star'} key={`filled-${index}`} size={24} color="#888" />
                ))}

                {/* Half Star */}
                {halfStar && <MaterialCommunityIcons name={'star-half'} size={24} color="#888" />}

                {/* Empty Stars */}
                {Array(emptyStars).fill(null).map((_, index) => (
                    <MaterialCommunityIcons name={'star-outline'} key={`empty-${index}`} size={24} color="#888" />
                ))}
            </View>
        );
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error fetching user data: {error.message}</Text>;

    return (
        <View style={styles.container}>
            {/* Profile Image */}
            <Image
                style={styles.profileImage}
                source={{ uri: userData?.profilePicture }} // Example image, replace with actual user image
            />

            {/* Profile Info */}
            <Text style={styles.name}>{userData?.firstName} {userData?.lastName}</Text>

            {/* Star Rating */}
            <View style={styles.ratingContainer}>
                {renderStars(userData?.userRating)}
                <Text style={styles.ratingText}>
                    {userData?.userRating !== null ? `${userData?.userRating}/5` : 'No rating available'}
                </Text>
            </View>

            {/* Action Items */}
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('UserPreferences')}  // Navigate to UserPreferences screen
            >
                <MaterialCommunityIcons name="account-wrench-outline" size={26} color="black" />
                <Text style={styles.menuText}>My Preferences</Text>
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
        marginTop: 50,
        width: 100,
        height: 100,
        borderRadius: 50,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 16,
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
