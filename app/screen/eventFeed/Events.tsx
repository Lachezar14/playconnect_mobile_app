import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, StyleSheet, RefreshControl, Animated, Text, FlatList, Platform} from 'react-native';
import EventCard from "../../components/event/EventCard";
import SearchFilter from "../../components/filters/SearchFilter";
import SportFilter from "../../components/filters/SportFilter";
import {addDistanceToEvents, fetchEvents} from "../../services/eventService";
import {getUserLocation} from "../../services/locationService";
import {Event} from "../../utilities/interfaces";
import {SafeAreaView} from "react-native-safe-area-context";
import EventCardSkeleton from "../../components/event/EventCardSkeleton";

const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [sports, setSports] = useState<string[]>([]);

    const scrollY = useRef(new Animated.Value(0)).current;

    const headerHeight = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE],
        outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            const userLocation = await getUserLocation();
            let fetchedEvents = await fetchEvents();

            if (userLocation) {
                fetchedEvents = addDistanceToEvents(fetchedEvents, userLocation.latitude, userLocation.longitude);
            }

            setEvents(fetchedEvents);
            setFilteredEvents(fetchedEvents);

            const uniqueSports = Array.from(new Set(fetchedEvents.map(event => event.sportType)));
            setSports(['All', ...uniqueSports]);

        } catch (error) {
            console.error("Error loading events: ", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    }, [loadEvents]);

    // Search and Filter Logic
    const handleSearch = (title: string) => {
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(title.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleFilterApply = (startDate: string, endDate: string) => {
        const filtered = events.filter((event) => {
            const eventDate = new Date(event.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const isWithinDateRange =
                (!start || eventDate >= start) &&
                (!end || eventDate <= end);

            return isWithinDateRange;
        });
        setFilteredEvents(filtered);
    };

    const handleSportSelect = (sport: string | null) => {
        if (sport === null || sport === 'All') {
            setFilteredEvents(events);
        } else {
            const filtered = events.filter(event =>
                event.sportType.toLowerCase() === sport.toLowerCase()
            );
            setFilteredEvents(filtered);
        }
    };

    // Group events by sport type (based on filteredEvents)
    const eventsBySport = filteredEvents.reduce((acc, event) => {
        const sport = event.sportType;
        if (!acc[sport]) {
            acc[sport] = [];
        }
        acc[sport].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    const renderHorizontalEventCard = ({ item }: { item: Event }) => (
        <View style={styles.horizontalCardContainer}>
            <EventCard event={item} targetPage="EventDetails" />
        </View>
    );

    const renderSection = (title: string, subtitle: string, sectionEvents: Event[]) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            </View>
            {loading ? (
                // Show skeleton while loading
                <FlatList
                    horizontal
                    data={Array(3).fill(0)}
                    renderItem={() => (
                        <View style={styles.horizontalCardContainer}>
                            <EventCardSkeleton />
                        </View>
                    )}
                    keyExtractor={(_, index) => `skeleton-${index}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            ) : (
                // Show actual events when loaded
                <FlatList
                    horizontal
                    data={sectionEvents}
                    renderItem={renderHorizontalEventCard}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                />
            )}
        </View>
    );

    const getRecommendedEvents = () => {
        // Logic to get recommended events - for now just return first 5
        return filteredEvents.slice(0, 5);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
                    <View style={styles.headerSearch}>
                        <View style={styles.headerTopSpacing} />
                        <SearchFilter onSearch={handleSearch} onFilterApply={handleFilterApply} />
                    </View>
                    <View style={styles.headerSports}>
                        <SportFilter
                            sports={sports}
                            onSportSelect={handleSportSelect}
                            loading={loading}
                        />
                    </View>
                </Animated.View>

                <Animated.ScrollView
                    contentContainerStyle={styles.scrollContent}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            progressViewOffset={HEADER_MAX_HEIGHT}
                        />
                    }
                >
                    {/* Recommended Section */}
                    {renderSection(
                        "Recommended for You",
                        "Events we think you'll love",
                        getRecommendedEvents()
                    )}

                    {/* Render sections for each sport */}
                    {Object.entries(eventsBySport).map(([sport, sportEvents]) => (
                        <React.Fragment key={sport}>
                            {renderSection(
                                sport,
                                `Popular ${sport} events near you`,
                                sportEvents
                            )}
                        </React.Fragment>
                    ))}

                    {/* Add bottom spacing to account for tab bar */}
                    <View style={styles.bottomSpacing} />
                </Animated.ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    headerSearch: {
        paddingHorizontal: 16,
    },
    headerSports: {
        marginLeft: 16,
    },
    headerTopSpacing: {
        height: 12, // Add space above the search bar
    },
    scrollContent: {
        paddingTop: HEADER_MAX_HEIGHT,
    },
    section: {
        marginLeft: 16,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    horizontalList: {
        paddingRight: 16,
    },
    horizontalCardContainer: {
        width: 250,
        marginRight: 16,
    },
    bottomSpacing: {
        height: Platform.select({
            ios: 90,
            android: 70,
            default: 0,
        }),
    },
});

export default Events;