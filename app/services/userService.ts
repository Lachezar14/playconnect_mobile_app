import { FIRESTORE_DB } from '../../firebaseConfig';
import {collection, doc, getDoc, getDocs, query, updateDoc, where} from 'firebase/firestore';
import {User, UserStats} from '../utilities/interfaces';
import {calculateDistance} from "../utilities/calcuteDistance"; // Ensure you have a User interface defined

export const fetchUserById = async (userId: string): Promise<User | null> => {
    try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            return {
                id: userDocSnap.id,
                ...userDocSnap.data()
            } as User;
        } else {
            console.log('No such user!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

export const fetchUserStats = async (userId: string): Promise<UserStats | null> => {
    try {
        const userStatsCollection = collection(FIRESTORE_DB, 'userStats');
        const q = query(userStatsCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userStatsDoc = querySnapshot.docs[0];
            return {
                id: userStatsDoc.id,
                ...userStatsDoc.data()
            } as UserStats;
        } else {
            console.log('No stats found for this user!');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
};

// New function to update user preferences (favourite sport and availability)
export const updateUserPreferences = async (userId: string, favouriteSport: string, isAvailable: boolean): Promise<void> => {
    try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        await updateDoc(userDocRef, {
            favouriteSport,   // Save the favourite sport
            isAvailable       // Save availability status
        });
        console.log('User preferences updated successfully');
    } catch (error) {
        console.error('Error updating user preferences:', error);
    }
};

// Fetch nearby users by sport and available status - 10 km radius by default
export const fetchNearbyUsers = async (
    eventLatitude: any,
    eventLongitude: any,
    favouriteSport: string,
    currentUserId: string,
    radius = 10
): Promise<User[]> => {
    try {
        const usersSnapshot = await getDocs(collection(FIRESTORE_DB, 'users'));
        const nearbyUsers = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(user => {
                // Exclude the current user
                if (user.id === currentUserId) {
                    console.log(`Skipping current user: ${currentUserId}`);
                    return false;
                }

                // Check if user has location data
                if (!user.latitude || !user.longitude) {
                    console.log(`User ${user.id} missing location data`);
                    return false;
                }

                // Calculate distance from the event
                const distance = calculateDistance(
                    eventLatitude,
                    eventLongitude,
                    user.latitude,
                    user.longitude
                );
                console.log(`User ${user.id} distance: ${distance.toFixed(2)} meters`);

                // Check if the user is nearby, has the same favorite sport, and is available
                const isNearby = distance <= radius * 1000; // Convert radius to meters
                const hasSameSport = user.favouriteSport === favouriteSport;
                const isAvailable = user.isAvailable === true;

                console.log(`User ${user.id} isNearby: ${isNearby}, hasSameSport: ${hasSameSport}, isAvailable: ${isAvailable}`);

                return isNearby && hasSameSport && isAvailable;
            });

        console.log(`Total nearby users found: ${nearbyUsers.length}`);
        return nearbyUsers;
    } catch (error) {
        console.error('Error fetching nearby users:', error);
        return [];
    }
};

// ... other existing methods in userService.ts