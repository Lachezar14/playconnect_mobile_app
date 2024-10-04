import { FIRESTORE_DB } from '../../firebaseConfig';
import {collection, query, where, getDocs, addDoc, deleteDoc, doc} from 'firebase/firestore';
import {dbCounter} from "../utilities/dbCounter";


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
    dbCounter.reset();
    const q = query(
        collection(FIRESTORE_DB, 'userLikedEvents'),
        where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    dbCounter.increment();

    const likedEventIds = querySnapshot.docs.map(doc => doc.data().eventId);
    console.log(`getUserLikedEventIds - Database calls: ${dbCounter.getCount()}, Liked events fetched: ${likedEventIds.length}`);
    return likedEventIds;
};
