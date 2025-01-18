import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIRESTORE_DB } from '../../firebaseConfig';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { User, UserStats } from '../utilities/interfaces';

// Cache keys
const CACHE_KEYS = {
    USER: (userId: string) => `user_${userId}`,
    USER_STATS: (userId: string) => `user_stats_${userId}`,
    COMPATIBLE_USERS: (criteria: string) => `compatible_users_${criteria}`,
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
    USER: 5 * 60 * 1000, // 5 minutes
    USER_STATS: 2 * 60 * 1000, // 2 minutes
    COMPATIBLE_USERS: 1 * 60 * 1000, // 1 minute
};

interface CachedData<T> {
    data: T;
    timestamp: number;
}

const isCacheValid = <T>(cachedData: CachedData<T> | null, expiryTime: number): cachedData is CachedData<T> => {
    if (!cachedData) return false;
    return Date.now() - cachedData.timestamp < expiryTime;
};

const getFromCache = async <T>(key: string): Promise<CachedData<T> | null> => {
    try {
        const cached = await AsyncStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error('Error reading from cache:', error);
        return null;
    }
};

const saveToCache = async <T>(key: string, data: T): Promise<void> => {
    try {
        const cacheData: CachedData<T> = {
            data,
            timestamp: Date.now(),
        };
        await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error saving to cache:', error);
    }
};

export const clearUserCache = async (userId: string): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            CACHE_KEYS.USER(userId),
            CACHE_KEYS.USER_STATS(userId),
        ]);
    } catch (error) {
        console.error('Error clearing user cache:', error);
    }
};

export const fetchUserById = async (userId: string): Promise<User | null> => {
    try {
        // Check cache first
        const cacheKey = CACHE_KEYS.USER(userId);
        const cached = await getFromCache<User>(cacheKey);

        if (isCacheValid(cached, CACHE_EXPIRY.USER)) {
            console.log('Returning user from cache');
            return cached.data;
        }

        // Fetch from Firestore if cache miss or expired
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = {
                id: userDocSnap.id,
                ...userDocSnap.data()
            } as User;

            // Update cache
            await saveToCache(cacheKey, userData);
            return userData;
        }

        console.log('No such user!');
        return null;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

export const fetchUserStats = async (userId: string): Promise<UserStats | null> => {
    try {
        // Check cache first
        const cacheKey = CACHE_KEYS.USER_STATS(userId);
        const cached = await getFromCache<UserStats>(cacheKey);

        if (isCacheValid(cached, CACHE_EXPIRY.USER_STATS)) {
            console.log('Returning user stats from cache');
            return cached.data;
        }

        // Fetch from Firestore if cache miss or expired
        const userStatsCollection = collection(FIRESTORE_DB, 'userStats');
        const q = query(userStatsCollection, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userStatsDoc = querySnapshot.docs[0];
            const userStats = {
                id: userStatsDoc.id,
                ...userStatsDoc.data()
            } as UserStats;

            // Update cache
            await saveToCache(cacheKey, userStats);
            return userStats;
        }

        console.log('No stats found for this user!');
        return null;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
};

export const updateUserPreferences = async (
    userId: string,
    favouriteSport: string,
    skillLevel: string,
    availability: string[]
): Promise<void> => {
    try {
        const userDocRef = doc(FIRESTORE_DB, 'users', userId);
        await updateDoc(userDocRef, {
            favouriteSport,
            skillLevel,
            availability
        });

        // Clear user cache after update
        await clearUserCache(userId);
        console.log('User preferences updated successfully');
    } catch (error) {
        console.error('Error updating user preferences:', error);
    }
};

export const fetchCompatibleUsers = async (
    favouriteSport: string,
    skillLevel: string,
    day: string,
    currentUserId: string
): Promise<User[]> => {
    try {
        // Create a unique cache key based on search criteria
        const criteria = `${favouriteSport}_${skillLevel}_${day}`;
        const cacheKey = CACHE_KEYS.COMPATIBLE_USERS(criteria);
        const cached = await getFromCache<User[]>(cacheKey);

        if (isCacheValid(cached, CACHE_EXPIRY.COMPATIBLE_USERS)) {
            console.log('Returning compatible users from cache');
            return cached.data.filter(user => user.id !== currentUserId);
        }

        const usersCollection = collection(FIRESTORE_DB, 'users');
        const q = query(
            usersCollection,
            where('favouriteSport', '==', favouriteSport),
            where('skillLevel', '==', skillLevel),
            where('availability', 'array-contains', day)
        );

        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() } as User));

        // Cache all users before filtering
        await saveToCache(cacheKey, users);

        // Filter out current user after retrieving from cache
        const filteredUsers = users.filter((user) => user.id !== currentUserId);
        console.log(`Total users found: ${filteredUsers.length}`);
        return filteredUsers;
    } catch (error) {
        console.error('Error fetching users by criteria:', error);
        return [];
    }
};