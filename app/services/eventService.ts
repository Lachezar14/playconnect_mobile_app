import {FIRESTORE_DB} from '../../firebaseConfig';
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where} from 'firebase/firestore';
import {Event, Suggestion} from '../utilities/interfaces';
import {checkIfJoined, deleteParticipantsByEventId} from "./eventParticipationService";
import {getUserLikedEventIds, removeAllLikesForEvent} from "./userLikedEventsService";
import moment from 'moment';
import {dbCounter} from "../utilities/dbCounter";
import {deleteInvitesByEventId} from "./eventInviteService";

// Cache for storing events locally
const eventCache = new Map<string, Event>();

// Fetch event by ID
export const fetchEventById = async (eventId: string): Promise<Event | null> => {
    try {
        // Check cache first
        if (eventCache.has(eventId)) {
            return eventCache.get(eventId)!; // Use non-null assertion since we check if it exists
        }

        // Fetch the document using doc() and getDoc()
        const eventDocRef = doc(FIRESTORE_DB, 'events', eventId);
        const eventDoc = await getDoc(eventDocRef);
        dbCounter.increment();

        // Check if the document exists
        if (!eventDoc.exists()) {
            return null;
        }

        const event = {
            id: eventDoc.id,
            ...eventDoc.data(), // No need for an array here since we get a single document
        } as Event;

        eventCache.set(eventId, event); // Cache the event
        return event;
    } catch (error) {
        console.error("Error fetching event by ID: ", error);
        return null;
    }
};

// Shared function to fetch events by IDs
const fetchEventsByIds = async (eventIds: string[]): Promise<Event[]> => {
    const cachedEvents: Event[] = [];
    const uncachedEventIds: string[] = [];

    // Check cache for each event
    eventIds.forEach(eventId => {
        if (eventCache.has(eventId)) {
            cachedEvents.push(eventCache.get(eventId)!);
        } else {
            uncachedEventIds.push(eventId);
        }
    });

    // If no uncached events, return from cache
    if (uncachedEventIds.length === 0) {
        return cachedEvents;
    }

    // Query Firestore for uncached events
    const eventsCollection = collection(FIRESTORE_DB, 'events');
    const eventQuery = query(eventsCollection, where('__name__', 'in', uncachedEventIds));
    const eventSnapshot = await getDocs(eventQuery);
    dbCounter.increment();

    const fetchedEvents = eventSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    })) as Event[];

    // Cache fetched events
    fetchedEvents.forEach(event => eventCache.set(event.id, event));

    return [...cachedEvents, ...fetchedEvents];
};


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

// Fetch events joined by user
export const fetchEventsJoinedByUserID = async (userId: string): Promise<Event[]> => {
    dbCounter.reset();
    try {
        const participantsCollection = collection(FIRESTORE_DB, 'eventParticipants');
        const participantsQuery = query(participantsCollection, where('userId', '==', userId));
        const participantsSnapshot = await getDocs(participantsQuery);
        dbCounter.increment();

        const eventIds = participantsSnapshot.docs.map(doc => doc.data().eventId);
        if (eventIds.length === 0) {
            console.log(`Database calls: ${dbCounter.getCount()}, Events fetched: 0`);
            return [];
        }

        const events = await fetchEventsByIds(eventIds);

        // Filter out events created by the same user
        const filteredEvents = events.filter(event => event.userId !== userId);

        console.log(`fetchEventsJoinedByUserID - Database calls: ${dbCounter.getCount()}, Events fetched: ${filteredEvents.length}`);
        return filteredEvents;
    } catch (error) {
        console.error("Error fetching events joined by user:", error);
        return [];
    }
};


// Fetch events liked by user
export const fetchEventsLikedByUser = async (userId: string): Promise<Event[]> => {
    dbCounter.reset();
    try {
        const likedEventIds = await getUserLikedEventIds(userId);
        if (likedEventIds.length === 0) {
            console.log(`Database calls: ${dbCounter.getCount()}, Events fetched: 0`);
            return [];
        }

        const events = await fetchEventsByIds(likedEventIds);
        console.log(`fetchEventsLikedByUser - Database calls: ${dbCounter.getCount()}, Events fetched: ${events.length}`);
        return events;
    } catch (error) {
        console.error("Error fetching liked events:", error);
        return [];
    }
};

// Fetch events created by the current user
export const fetchEventsCreatedByUser = async (userId: string): Promise<Event[]> => {
    try {
        const eventsCollection = collection(FIRESTORE_DB, 'events');
        const eventsQuery = query(eventsCollection, where('userId', '==', userId));
        const eventSnapshot = await getDocs(eventsQuery);

        return eventSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Event[];
    } catch (error) {
        console.error("Error fetching events created by user:", error);
        return [];
    }
};

// Fetch upcoming events that the user has not joined
export const fetchUpcomingEventsNotJoinedByUser = async (userId: string, favouriteSport: string): Promise<Event[]> => {
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
        const events = (await Promise.all(eventPromises)).filter(Boolean) as Event[];

        // Step 3: Sort events by sportType matching the user's favouriteSport
        return events.sort((a, b) => {
            if (a.sportType === favouriteSport && b.sportType !== favouriteSport) {
                return -1; // a comes first
            } else if (a.sportType !== favouriteSport && b.sportType === favouriteSport) {
                return 1; // b comes first
            }
            return 0; // No change
        });
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
export const createEvent = async (userId: string, title: string, date: Date, time: Date, location: Suggestion, sportType: string, skillLevel: string, spots: number, eventImage: string): Promise<string> => {
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
        const eventDocRef = await addDoc(eventCollection, {
            userId,
            title,
            date: formattedDateTimeUTC,
            sportType,
            skillLevel,
            spots: parseInt(spots.toString(), 10),
            takenSpots: 0,
            street: location?.street,
            streetNumber: location?.streetNumber,
            city: location?.city,
            postcode: location?.postcode,
            latitude: Number(location?.latitude),
            longitude: Number(location?.longitude),
            eventImage,
        });

        // Return the event ID
        return eventDocRef.id;
    } catch (error) {
        console.error('Error adding event: ', error);
        throw new Error('Error creating event');
    }
};

// Method to delete an event by eventId
export const deleteEventById = async (eventId: string): Promise<void> => {
    try {
        // Step 1: Delete associated event participants
        await deleteParticipantsByEventId(eventId);

        // Step 2: Delete associated liked events
        await deleteInvitesByEventId(eventId);

        // Step 3: Delete associated event likes
        await removeAllLikesForEvent(eventId);

        // Step : Delete the event itself from the 'events' collection
        const eventDocRef = doc(FIRESTORE_DB, 'events', eventId);
        await deleteDoc(eventDocRef);

        console.log(`Event with ID: ${eventId} has been successfully deleted.`);
    } catch (error) {
        console.error(`Error deleting event with ID: ${eventId}`, error);
        throw new Error(`Failed to delete event with ID: ${eventId}`);
    }
};