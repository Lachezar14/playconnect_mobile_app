// EventInvitesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useAuth} from "./AuthContext";
import {EventInvite} from "../utilities/interfaces";
import {onSnapshot, collection, query, where} from "firebase/firestore";
import {FIRESTORE_DB} from "../../firebaseConfig";

// Define the context type
interface EventInvitesContextType {
    invitations: EventInvite[];
    invitationCount: number;
}

const EventInvitesContext = createContext<EventInvitesContextType | undefined>(undefined);

interface EventInvitesProviderProps {
    children: ReactNode;
}

// Create the context with an initial value of undefined
export const EventInvitesProvider: React.FC<EventInvitesProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<EventInvite[]>([]);
    const [invitationCount, setInvitationCount] = useState<number>(0);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const setupInvitesListener = async () => {
            if (!user?.uid) return;

            try {
                // Setup real-time listener
                const invitesQuery = query(
                    collection(FIRESTORE_DB, "eventInvites"),
                    where("invitedUserId", "==", user.uid)
                );

                unsubscribe = onSnapshot(invitesQuery, (snapshot) => {
                    const updatedInvites: EventInvite[] = snapshot.docs.map(doc => {
                        const data = doc.data();
                        console.log("invitedAt:", data.invitedAt); // Log the invitedAt field
                        return {
                            id: doc.id,
                            eventId: data.eventId,
                            eventCreatorId: data.eventCreatorId,
                            invitedUserId: data.invitedUserId,
                            status: data.status,
                            createdAt: data.createdAt,
                            invitedAt: data.invitedAt, // Ensure invitedAt is included
                        };
                    });

                    // Sort invites
                    const sortedInvites = sortInvites(updatedInvites);

                    // Force a new array reference and ensure all properties are enumerated
                    setInvitations([...sortedInvites]);
                    setInvitationCount(sortedInvites.filter(invite => invite.status === 'pending').length);
                });
            } catch (error) {
                console.error("Error setting up event invites listener:", error);
            }
        };

        setupInvitesListener();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user?.uid]);

    const sortInvites = (invites: EventInvite[]): EventInvite[] => {
        return [...invites].sort((a, b) => {
            // Sort by status (pending first)
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            // Then sort by date created (newest first)
            return b.invitedAt.toMillis() - a.invitedAt.toMillis();
        });
    };

    return (
        <EventInvitesContext.Provider value={{ invitations, invitationCount }}>
            {children}
        </EventInvitesContext.Provider>
    );
};

// Custom hook to access event invites and pending count
export const useEventInvites = (): EventInvitesContextType => {
    const context = useContext(EventInvitesContext);
    if (context === undefined) {
        throw new Error('useEventInvites must be used within an EventInvitesProvider');
    }
    return context;
};

export type { EventInvite, EventInvitesContextType };