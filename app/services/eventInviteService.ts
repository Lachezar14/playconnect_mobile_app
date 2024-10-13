import {addDoc, collection, getDocs, query, where} from "firebase/firestore";
import {FIRESTORE_DB} from "../../firebaseConfig";
import {EventInvite} from "../utilities/interfaces";

export const addEventInvite = async (eventInvite: EventInvite): Promise<void> => {
    try {
        const eventInviteWithTimestamp = {
            ...eventInvite,
            invitedAt: new Date(), // Ensure the invite has the current Firestore server timestamp
        };

        // Add a new document to the 'eventInvites' collection
        const eventInvitesCollection = collection(FIRESTORE_DB, 'eventInvites');
        const docRef = await addDoc(eventInvitesCollection, eventInviteWithTimestamp);
    } catch (error) {
        console.error("Error adding event invite:", error);
    }
};

// Method to fetch event invites by eventId
export const fetchEventInvitesByEventId = async (eventId: string): Promise<EventInvite[]> => {
    try {
        const eventInvitesCollection = collection(FIRESTORE_DB, 'eventInvites');
        const eventInvitesQuery = query(eventInvitesCollection, where('eventId', '==', eventId));
        const querySnapshot = await getDocs(eventInvitesQuery);

        const invites = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as unknown as EventInvite[];

        return invites;
    } catch (error) {
        console.error("Error fetching event invites:", error);
        throw new Error("Failed to fetch event invites");
    }
};

// Method to fetch event invites by invitedUserId
export const fetchEventInvitesByUserId = async (userId: string): Promise<EventInvite[]> => {
    try {
        const eventInvitesCollection = collection(FIRESTORE_DB, 'eventInvites');
        const eventInvitesQuery = query(eventInvitesCollection, where('invitedUserId', '==', userId));
        const querySnapshot = await getDocs(eventInvitesQuery);

        const invites = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as unknown as EventInvite[];

        return invites;
    } catch (error) {
        console.error("Error fetching event invites:", error);
        throw new Error("Failed to fetch event invites");
    }
};