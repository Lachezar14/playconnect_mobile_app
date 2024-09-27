import { FIRESTORE_DB } from '../../firebaseConfig';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {Event} from '../utilities/interfaces';


export const fetchEvents = async (): Promise<Event[]> => {
    try {
        const eventsCollection = collection(FIRESTORE_DB, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        return eventSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Event[];
    } catch (error) {
        console.error("Error fetching events: ", error);
        return [];
    }
};

export const fetchEventsByUserId = async (userId: string): Promise<Event[]> => {
    try {
        const participantsCollection = collection(FIRESTORE_DB, 'eventParticipants');
        const participantsQuery = query(participantsCollection, where('userId', '==', userId));
        const participantsSnapshot = await getDocs(participantsQuery);

        const eventIds = participantsSnapshot.docs.map(doc => doc.data().eventId);

        if (eventIds.length === 0) {
            return [];
        }

        const eventsCollection = collection(FIRESTORE_DB, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        return eventSnapshot.docs
            .filter(doc => eventIds.includes(doc.id))
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Event[];
    } catch (error) {
        console.error("Error fetching events by user ID: ", error);
        return [];
    }
};

export const addDistanceToEvents = (events: Event[], userLat: number, userLon: number): Event[] => {
    return events.map(event => {
        const distanceInMeters = calculateDistance(userLat, userLon, event.latitude, event.longitude);
        const formattedDistance = distanceInMeters < 1000 ? `${Math.round(distanceInMeters)}m` : `${(distanceInMeters / 1000).toFixed(1)}km`;

        return {
            ...event,
            distance: formattedDistance,  // For display
            distanceNum: distanceInMeters  // For filtering
        };
    });
};


const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c; // Distance in kilometers

    return dist * 1000; // Convert to meters
};
