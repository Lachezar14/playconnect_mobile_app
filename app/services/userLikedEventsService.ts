import { FIRESTORE_DB } from '../../firebaseConfig';
import {collection, query, where, getDocs, addDoc, deleteDoc, doc} from 'firebase/firestore';

// Check if the event is liked by the user
export const isEventLiked = async (userId: string, eventId: string) => {
    const q = query(
        collection(FIRESTORE_DB, 'userLikedEvents'),
        where('userId', '==', userId),
        where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
};

// Like the event
export const likeEvent = async (userId: string, eventId: string) => {
    const likedEventRef = collection(FIRESTORE_DB, 'userLikedEvents');
    await addDoc(likedEventRef, {
        userId,
        eventId,
        likedAt: new Date().toISOString(),
    });
};

// Unlike the event
export const unlikeEvent = async (userId: string, eventId: string) => {
    const q = query(
        collection(FIRESTORE_DB, 'userLikedEvents'),
        where('userId', '==', userId),
        where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(q);

    // If we find the document, delete it
    if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        const likedEventDocRef = doc(FIRESTORE_DB, 'userLikedEvents', docId);
        await deleteDoc(likedEventDocRef);
    }
};

// Get all liked event IDs for a user
export const getUserLikedEventIds = async (userId: string) => {
    const q = query(
        collection(FIRESTORE_DB, 'userLikedEvents'),
        where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    const likedEventIds: string[] = [];
    querySnapshot.forEach((doc) => {
        likedEventIds.push(doc.data().eventId);
    });

    return likedEventIds;
};
