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
// You can add more interfaces or types here as needed