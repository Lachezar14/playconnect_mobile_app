import React, { useEffect, useState } from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Alert} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import EventCardSwipe from "../../components/event/EventCardSwipe";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterModal from '../../components/filters/FilterModal';
import { Feather } from "@expo/vector-icons";
import {getUserLocation} from "../../services/locationService";
import {addDistanceToEvents, fetchUpcomingEventsNotJoinedByUser} from "../../services/eventService";
import { Event } from '../../utilities/interfaces';
import {eventJoin} from "../../services/eventParticipationService";
import {useAuth} from "../../context/AuthContext";
import CustomAlert from "../../components/CustomAlert";

const defaultFilters = { sport: 'All', maxDistance: 50 };

interface Filters {
    sport: string;
    maxDistance: number;
}

// @ts-ignore
const QuickJoin = ({ navigation, route }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filters, setFilters] = useState(defaultFilters);
    const { user } = useAuth();

    useEffect(() => {
        const loadEventsAndLocation = async () => {
            const userLocation = await getUserLocation();
            const fetchedEvents = await fetchUpcomingEventsNotJoinedByUser(user?.uid || '');

            if (userLocation) {
                const eventsWithDistance = addDistanceToEvents(fetchedEvents, userLocation.latitude, userLocation.longitude);
                setEvents(eventsWithDistance);
                setFilteredEvents(eventsWithDistance);
            } else {
                setEvents(fetchedEvents);
                setFilteredEvents(fetchedEvents);
            }
        };

        loadEventsAndLocation();
    }, []);

    useEffect(() => {
        if (route.params?.openModal) {
            setModalVisible(true);
        }
    }, [route.params?.openModal]);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Feather name="sliders" size={24} color="#333" style={{ marginRight: 20 }} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        applyFilters(filters);
    }, [filters]);

    const onSwipedUp = (index: number) => {
        const event = filteredEvents[index];
        navigation.navigate('EventDetails', { event });
    };

    const onSwipedRight = async (index: number) => {
        const event = filteredEvents[index];
        if (!event.id || !user?.uid) {
            console.error('Event ID or User ID is undefined');
            return;
        }

        try {
            await eventJoin(event.id, user.uid);
            Alert.alert('Event Joined', 'You have successfully joined the event!');

        } catch (error: Error | any) {
            if (error.message === 'No more places available') {
                Alert.alert('Registration Failed', 'Sorry, there are no more available places for this event.');
            } else {
                console.error('Error joining event: ', error);
                Alert.alert('Error joining event', 'An error occurred while trying to join the event. Please try again later.');
            }
        }
    };

    const onSwipedLeft = (index: number) => {
        const event = filteredEvents[index];
        console.log(`Skipped ${event.title}`);
    };

    const applyFilters = (newFilters: Filters) => {
        const filtered = events.filter(event => {
            const matchesSport = newFilters.sport === 'All' || event.sportType === newFilters.sport;
            const matchesDistance = event.distanceNum !== undefined && event.distanceNum / 1000 <= newFilters.maxDistance;
            return matchesSport && matchesDistance;
        });
        setFilteredEvents(filtered);
        setCurrentIndex(0);
    };

    const handleApplyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    const handleResetFilters = () => {
        setFilters(defaultFilters);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Add the "No more events" text behind the cards */}
            <View style={styles.messageContainer}>
                <Text style={styles.noMoreEventsText}>No events match your current filters.</Text>
            </View>
            {filteredEvents.length > 0 ? (
                <Swiper
                    cards={filteredEvents}
                    renderCard={(card) =>
                        <EventCardSwipe
                            event={card}
                        />}
                    onSwipedRight={onSwipedRight}
                    onSwipedLeft={onSwipedLeft}
                    onSwipedTop={onSwipedUp}
                    disableBottomSwipe={true} // Disable swipe down
                    cardIndex={currentIndex}
                    backgroundColor={'transparent'}
                    stackSize={3}
                    cardVerticalMargin={0}
                    cardHorizontalMargin={0}
                    animateOverlayLabelsOpacity
                    animateCardOpacity
                    containerStyle={styles.swiperContainer}
                    overlayLabels={{
                        left: {
                            title: 'NOPE',
                            style: {
                                label: {
                                    backgroundColor: 'red',
                                    color: 'white',
                                    fontSize: 48,
                                    fontWeight: 'bold',
                                    padding: 10,
                                    borderRadius: 10,
                                },
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                }
                            }
                        },
                        right: {
                            title: 'JOIN',
                            style: {
                                label: {
                                    backgroundColor: 'green',
                                    color: 'white',
                                    fontSize: 48,
                                    fontWeight: 'bold',
                                    padding: 10,
                                    borderRadius: 10,
                                },
                                wrapper: {
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                }
                            }
                        }
                    }}
                />
            ) : (
                <View style={styles.noEventsContainer}>
                    <Text style={styles.noEventsText}></Text>
                </View>
            )}

            <FilterModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onApplyFilters={handleApplyFilters}
                onResetFilters={handleResetFilters}
                initialFilters={filters}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    swiperContainer: {
        flex: 1,
    },
    noEventsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noEventsText: {
        fontSize: 18,
        textAlign: 'center',
        padding: 20,
    },
    messageContainer: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        zIndex: -1, // Ensure the text is behind the cards
        justifyContent: 'center',
        alignItems: 'center',
    },
    noMoreEventsText: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 10,
    },
    changeFiltersText: {
        fontSize: 18,
        color: 'blue',
        textDecorationLine: 'underline',
    },

});

export default QuickJoin;