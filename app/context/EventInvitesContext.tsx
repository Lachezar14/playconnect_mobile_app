// EventInvitesContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {useAuth} from "./AuthContext";
import {EventInvite} from "../utilities/interfaces";
import {fetchEventInvitesByUserId} from "../services/eventInviteService";

interface EventInvitesContextType {
    invitations: EventInvite[];
    invitationCount: number;
}

// Create the context with an initial value of undefined
const EventInvitesContext = createContext<EventInvitesContextType | undefined>(undefined);

interface EventInvitesProviderProps {
    children: ReactNode;
}

export const EventInvitesProvider: React.FC<EventInvitesProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<EventInvite[]>([]);
    const [invitationCount, setInvitationCount] = useState<number>(0);

    useEffect(() => {
        const fetchInvites = async () => {
            if (user?.uid) {
                try {
                    const fetchedInvites = await fetchEventInvitesByUserId(user.uid);
                    const pendingInvites = fetchedInvites.filter(invite => invite.status === 'pending');

                    setInvitations(fetchedInvites);
                    setInvitationCount(pendingInvites.length);
                } catch (error) {
                    console.error("Error fetching event invites:", error);
                }
            }
        };

        fetchInvites();
    }, [user?.uid]);

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
