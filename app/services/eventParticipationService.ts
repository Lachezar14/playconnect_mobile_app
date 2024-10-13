import { FIRESTORE_DB } from '../../firebaseConfig';
import {doc, runTransaction, addDoc, collection, query, where, getDocs, updateDoc, deleteDoc} from 'firebase/firestore';
import {Participant} from "../utilities/interfaces";

// Fetch all participants that have joined an event, their names and IDs
export const fetchParticipants = async (eventId: string): Promise<Participant[]> => {
    if (!eventId) throw new Error('Event ID is undefined');

    const eventParticipantsQuery = query(
        collection(FIRESTORE_DB, 'eventParticipants'),
        where('eventId', '==', eventId)
    );
    const querySnapshot = await getDocs(eventParticipantsQuery);

    const participantPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        const userId = data.userId;

        const userQuery = query(
            collection(FIRESTORE_DB, 'users'),
            where('userId', '==', userId)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            return { id: userId, firstName: userData.firstName, lastName: userData.lastName };
        }
        return null;
    });

    return (await Promise.all(participantPromises)).filter(Boolean) as Participant[];
};

// Check if user has joined an event
export const checkIfJoined = async (eventId: string, userId: string): Promise<boolean> => {
    try {
        const eventParticipantsQuery = query(
            collection(FIRESTORE_DB, 'eventParticipants'),
            where('userId', '==', userId),
            where('eventId', '==', eventId)
        );
        const querySnapshot = await getDocs(eventParticipantsQuery);

        return !querySnapshot.empty; // Returns true if the user is found, false otherwise
    } catch (error) {
        console.error('Error checking participation:', error);
        throw error; // You can throw the error to handle it in the component
    }
};

// Join an event
export const eventJoin = async (eventId: string, userId: string): Promise<void> => {
    if (!eventId || !userId) {
        throw new Error('Event ID or User ID is undefined');
    }

    try {
        await runTransaction(FIRESTORE_DB, async (transaction) => {
            const eventDocRef = doc(FIRESTORE_DB, 'events', eventId);
            const eventDocSnapshot = await transaction.get(eventDocRef);

            if (!eventDocSnapshot.exists()) {
                throw new Error('Event does not exist!');
            }

            const currentEventData = eventDocSnapshot.data();
            const availableSpots = currentEventData.spots;
            const takenSpots = currentEventData.takenSpots || 0;
            const totalSpots = availableSpots - takenSpots;

            if (totalSpots <= 0) {
                throw new Error('No more places available');
            }

            const eventParticipantsCollection = collection(FIRESTORE_DB, 'eventParticipants');
            await addDoc(eventParticipantsCollection, {
                userId,
                eventId,
                joinedAt: new Date().toISOString(),
            });

            transaction.update(eventDocRef, {
                takenSpots: takenSpots + 1,
            });
        });
    } catch (error: Error | any) {
        throw new Error(error.message || 'Error joining event');
    }
};

// Leave an event
export const eventLeave = async (eventId: string, userId: string): Promise<void> => {
    if (!eventId || !userId) {
        throw new Error('Event ID or User ID is undefined');
    }

    try {
        await runTransaction(FIRESTORE_DB, async (transaction) => {
            const eventParticipantsQuery = query(
                collection(FIRESTORE_DB, 'eventParticipants'),
                where('userId', '==', userId),
                where('eventId', '==', eventId)
            );
            const querySnapshot = await getDocs(eventParticipantsQuery);

            if (querySnapshot.empty) {
                throw new Error('You are not registered for this event');
            }

            const eventDocRef = doc(FIRESTORE_DB, 'events', eventId);
            const eventDocSnapshot = await transaction.get(eventDocRef);

            if (!eventDocSnapshot.exists()) {
                throw new Error('Event does not exist!');
            }

            const currentEventData = eventDocSnapshot.data();
            const takenSpots = currentEventData.takenSpots || 0;

            if (takenSpots <= 0) {
                throw new Error('Error: No places to decrement');
            }

            querySnapshot.forEach((docSnapshot) => {
                const participantDocRef = doc(FIRESTORE_DB, 'eventParticipants', docSnapshot.id);
                transaction.delete(participantDocRef);
            });

            transaction.update(eventDocRef, {
                takenSpots: takenSpots - 1,
            });
        });
    } catch (error: Error | any) {
        throw new Error(error.message || 'Error leaving event');
    }
};

// Check if the user has already checked in
export const checkIfCheckedIn = async (eventId: string, userId: string): Promise<boolean> => {
    try {
        const eventParticipantsQuery = query(
            collection(FIRESTORE_DB, 'eventParticipants'),
            where('userId', '==', userId),
            where('eventId', '==', eventId),
            where('isCheckedIn', '==', true)
        );
        const querySnapshot = await getDocs(eventParticipantsQuery);
        return !querySnapshot.empty; // Return true if already checked in
    } catch (error) {
        console.error('Error checking check-in status:', error);
        throw error; // You can throw the error to handle it in the component
    }
};

// Update check-in status for the user
export const updateCheckInStatus = async (eventId: string, userId: string): Promise<void> => {
    try {
        const eventParticipantsQuery = query(
            collection(FIRESTORE_DB, 'eventParticipants'),
            where('userId', '==', userId),
            where('eventId', '==', eventId)
        );
        const querySnapshot = await getDocs(eventParticipantsQuery);

        if (querySnapshot.empty) {
            throw new Error('User is not registered for this event');
        }

        const participantDoc = querySnapshot.docs[0]; // Get the participant's doc
        const participantDocRef = doc(FIRESTORE_DB, 'eventParticipants', participantDoc.id);

        // Update check-in status
        await updateDoc(participantDocRef, {
            isCheckedIn: true,
            checkedInAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error updating check-in status:', error);
        throw error;
    }
};

// Delete all participants by event ID
export const deleteParticipantsByEventId = async (eventId: string): Promise<void> => {
    try {
        const eventParticipantsQuery = query(
            collection(FIRESTORE_DB, 'eventParticipants'),
            where('eventId', '==', eventId)
        );
        const querySnapshot = await getDocs(eventParticipantsQuery);

        const deletePromises = querySnapshot.docs.map((docSnapshot) =>
            deleteDoc(docSnapshot.ref) // Use deleteDoc here
        );

        await Promise.all(deletePromises);
        console.log(`Deleted all participants for event: ${eventId}`);
    } catch (error) {
        console.error('Error deleting participants:', error);
        throw new Error('Failed to delete participants for the event');
    }
};
