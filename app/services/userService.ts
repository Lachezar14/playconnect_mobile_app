import { FIRESTORE_DB } from '../../firebaseConfig';
import {collection, doc, getDoc, getDocs, query, where} from 'firebase/firestore';
import {User, UserStats} from '../utilities/interfaces'; // Ensure you have a User interface defined

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


// ... other existing methods in userService.ts