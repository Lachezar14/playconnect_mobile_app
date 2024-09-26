import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import EventCardSwipe from "../components/EventCardSwipe";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterModal from '../components/FilterModal';
import { Feather } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../firebaseConfig";
import useGeolocation from "../utilities/useGeolocation";

// Define the event type
interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    availablePlaces: number;
    sportType: string;
    userId: string;
    latitude: number;
    longitude: number;
    distance?: number;
}

const defaultFilters = { sport: 'All', maxDistance: 50 };

const QuickJoin = ({ navigation, route }) => {
    const { userLocation, calculateEventDistance } = useGeolocation(0, 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filters, setFilters] = useState(defaultFilters);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsCollection = collection(FIRESTORE_DB, 'events');
                const eventSnapshot = await getDocs(eventsCollection);
                const eventList: Event[] = eventSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Event[];

                if (userLocation) {
                    // Calculate distance for each event
                    const eventsWithDistance = eventList.map(event => {
                        // Call calculateEventDistance for each event
                        const distance = calculateEventDistance(event.latitude, event.longitude);
                        return {
                            ...event,
                            distance,
                        };
                    });

                    setEvents(eventsWithDistance);
                    setFilteredEvents(eventsWithDistance); // Initialize with full event list including distance
                } else {
                    setEvents(eventList);
                    setFilteredEvents(eventList); // Initialize without distances if user location is not available
                }
            } catch (error) {
                console.error("Error fetching events: ", error);
            }
        };
        fetchEvents();
    }, [userLocation]);

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

    const onSwipedRight = (index) => {
        const event = filteredEvents[index];
        console.log(`Joined ${event.title}`);
        // Add logic to handle event joining (e.g., save the event in Firebase)
    };

    const onSwipedLeft = (index) => {
        const event = filteredEvents[index];
        console.log(`Skipped ${event.title}`);
    };

    const applyFilters = (newFilters) => {
        const filtered = events.filter(event => {
            const matchesSport = newFilters.sport === 'All' || event.sport === newFilters.sport;
            const matchesDistance = event.distance <= newFilters.maxDistance;
            return matchesSport && matchesDistance;
        });
        setFilteredEvents(filtered);
        setCurrentIndex(0);
    };

    const handleApplyFilters = (newFilters) => {
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
                    renderCard={(card) => <EventCardSwipe event={card} />}
                    onSwipedRight={onSwipedRight}
                    onSwipedLeft={onSwipedLeft}
                    cardIndex={currentIndex}
                    backgroundColor={'transparent'}
                    stackSize={3}
                    cardVerticalMargin={0}
                    cardHorizontalMargin={0}
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