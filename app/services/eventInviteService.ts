import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where} from "firebase/firestore";
import {FIRESTORE_DB} from "../../firebaseConfig";
import {EventInvite} from "../utilities/interfaces";
import {eventJoin} from "./eventParticipationService";

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

// Method to fetch an event invite by ID
export const fetchEventInviteById = async (inviteId: string): Promise<EventInvite | null> => {
    try {
        const eventInviteDoc = doc(FIRESTORE_DB, 'eventInvites', inviteId);
        const inviteSnapshot = await getDoc(eventInviteDoc);

        if (inviteSnapshot.exists()) {
            return {
                id: inviteSnapshot.id,
                ...inviteSnapshot.data(),
            } as unknown as EventInvite;
        } else {
            console.error("Event invite not found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching event invite by ID:", error);
        throw new Error("Failed to fetch event invite");
    }
};

// Method to accept an event invite and join the event
export const acceptEventInvite = async (inviteId: string, eventId: string, userId: string): Promise<void> => {
    if (!inviteId || !eventId || !userId) {
        throw new Error('Invite ID, Event ID, or User ID is missing');
    }

    try {
        // Update the invite status to 'accepted'
        const inviteDocRef = doc(FIRESTORE_DB, 'eventInvites', inviteId);
        await updateDoc(inviteDocRef, { status: 'accepted' });

        // Join the event for the user
        await eventJoin(eventId, userId);

        console.log(`Invite ${inviteId} accepted and user ${userId} joined event ${eventId}`);
    } catch (error: Error | any) {
        console.error("Error accepting invite and joining event:", error);
        throw new Error(error.message || 'Failed to accept invite and join event');
    }
};

// Method to decline an event invite
export const declineEventInvite = async (inviteId: string): Promise<void> => {
    try {
        const eventInviteDoc = doc(FIRESTORE_DB, 'eventInvites', inviteId);
        await updateDoc(eventInviteDoc, { status: 'declined' });
        console.log(`Event invite ${inviteId} declined`);
    } catch (error) {
        console.error("Error declining event invite:", error);
        throw new Error("Failed to decline event invite");
    }
};

// Delete all event invites by event ID
export const deleteInvitesByEventId = async (eventId: string): Promise<void> => {
    try {
        const eventInvitesQuery = query(
            collection(FIRESTORE_DB, 'eventInvites'),
            where('eventId', '==', eventId)
        );
        const querySnapshot = await getDocs(eventInvitesQuery);

        const deletePromises = querySnapshot.docs.map((docSnapshot) =>
            deleteDoc(docSnapshot.ref) // Use deleteDoc here
        );

        await Promise.all(deletePromises);
        console.log(`Deleted all event invites for event: ${eventId}`);
    } catch (error) {
        console.error('Error deleting event invites:', error);
        throw new Error('Failed to delete event invites for the event');
    }
};