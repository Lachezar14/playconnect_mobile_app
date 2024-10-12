export interface Event {
    id: string;
    city: string;
    date: string;
    latitude: number;
    longitude: number;
    postcode: string;
    sportType: string;
    spots: number;
    street: string;
    streetNumber: string;
    takenSpots: number;
    title: string;
    userId: string;
    distance?: string;  // Optional string for display
    distanceNum?: number; // Optional, actual number distance in meters
}

export interface User {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    isAvailable: boolean;
    favouriteSport: string;
    latitude: number;
    longitude: number;
}

export interface EventParticipant {
    id?: string;
    eventId: string;
    joinedAt: string;
    userId: string;
}

export interface UserStats {
    id?: string;
    checkInPercent: string;
    eventsCheckedIn: string;
    eventsCreated: string;
    eventsSignUp: string;
    favouriteSport: string;
    userId: string;
    userRating: string;
}

export interface Participant {
    id: string;
    firstName: string;
    lastName: string;
}

export interface Suggestion {
    place_id: string;
    street: string;
    streetNumber: string;
    city: string;
    postcode: string;
    latitude: number;
    longitude: number;
}

export interface EventInvite {
    eventCreatorId: string;
    eventId: string;
    invitedUserId: string;
    invitedAt?: any; // You can set this as Date or Firestore Timestamp
    status: 'pending' | 'accepted' | 'declined'; // Example statuses
}

// You can add more interfaces or types here as needed