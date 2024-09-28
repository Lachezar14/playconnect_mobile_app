import {FIRESTORE_DB} from '../../firebaseConfig';
import {addDoc, collection, getDocs, query, where} from 'firebase/firestore';
import {Event, Suggestion} from '../utilities/interfaces';
import {checkIfJoined} from "./eventParticipationService";
import {getUserLikedEventIds} from "./userLikedEventsService";
import moment from 'moment';

// Fetch all events from Firestore
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

// Fetch events by user ID
export const fetchEventsJoinedByUserID = async (userId: string): Promise<Event[]> => {
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

// Fetch liked events by user
export const fetchUserLikedEvents = async (userId: string): Promise<Event[]> => {
    try {
        // Step 1: Get the event IDs of the liked events
        const likedEventIds = await getUserLikedEventIds(userId);

        if (likedEventIds.length === 0) {
            return [];
        }

        // Step 2: Fetch the liked events by their IDs
        const eventsCollection = collection(FIRESTORE_DB, 'events');
        const eventSnapshot = await getDocs(eventsCollection);

        // Step 3: Filter events by liked event IDs
        return eventSnapshot.docs
            .filter(doc => likedEventIds.includes(doc.id))
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as Event[];
    } catch (error) {
        console.error("Error fetching liked events: ", error);
        return [];
    }
};

// Fetch upcoming events that the user has not joined
export const fetchUpcomingEventsNotJoinedByUser = async (userId: string): Promise<Event[]> => {
    try {
        // Step 1: Fetch upcoming events from Firestore
        const currentDate = new Date().toISOString(); // Convert to ISO 8601 string in UTC format
        const eventsCollection = collection(FIRESTORE_DB, 'events');
        const upcomingEventsQuery = query(eventsCollection, where('date', '>', currentDate));
        const eventSnapshot = await getDocs(upcomingEventsQuery);

        // Step 2: Filter out events the user has joined
        const eventPromises = eventSnapshot.docs.map(async (doc) => {
            const eventId = doc.id;
            const joined = await checkIfJoined(eventId, userId); // Check if the user has joined the event
            if (!joined) {
                return {
                    id: doc.id,
                    ...doc.data(),
                } as Event;
            }
            return null; // Return null if user has joined the event
        });

        // Wait for all event join checks to complete, and filter out nulls
        return (await Promise.all(eventPromises)).filter(Boolean) as Event[];
    } catch (error) {
        console.error("Error fetching upcoming events not joined by user:", error);
        return [];
    }
};

// Fetch only upcoming events (not passed)
export const fetchUpcomingEvents = async (): Promise<Event[]> => {
    try {
        const currentDate = new Date().toISOString(); //Convert to ISO 8601 string in UTC format, same as the date format in Firestore
        const eventsCollection = collection(FIRESTORE_DB, 'events');
        const upcomingEventsQuery = query(eventsCollection, where('date', '>', currentDate));
        const eventSnapshot = await getDocs(upcomingEventsQuery);

        return eventSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Event[];
    } catch (error) {
        console.error("Error fetching upcoming events: ", error);
        return [];
    }
};

// Add distance to events based on user location
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

// Calculate distance between two coordinates
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

// Method to create an event and save to Firestore
export const createEvent = async (
    userId: string,
    title: string,
    date: Date,
    time: Date,
    location: Suggestion,
    sportType: string,
    spots: number
): Promise<void> => {
    // Combine date and time into a single Date object and convert to UTC
    const eventDateTime = moment(date)
        .set({
            hour: moment(time).hour(),
            minute: moment(time).minute(),
        })
        .utc();

    // Format the event date and time for storage
    const formattedDateTimeUTC = eventDateTime.format();

    try {
        const eventCollection = collection(FIRESTORE_DB, 'events');
        await addDoc(eventCollection, {
            userId,
            title,
            date: formattedDateTimeUTC,
            sportType,
            spots: parseInt(spots.toString(), 10),
            takenSpots: 0,
            street: location?.street,
            streetNumber: location?.streetNumber,
            city: location?.city,
            postcode: location?.postcode,
            latitude: Number(location?.latitude),
            longitude: Number(location?.longitude),
        });
    } catch (error) {
        console.error('Error adding event: ', error);
        throw new Error('Error creating event');
    }
};
