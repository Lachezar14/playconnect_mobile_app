// screens/QuickJoin.tsx
import React, {useRef, useState} from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import EventCardSwipe from "../components/EventCardSwipe";
import {SafeAreaView} from "react-native-safe-area-context";

const { width, height } = Dimensions.get('window');

const events = [
    { title: 'Football Match', sport: 'Football', distance: '2 km', startTime: '14:00' },
    { title: 'Tennis Game', sport: 'Tennis', distance: '1.5 km', startTime: '15:30' },
    { title: 'Basketball Pickup', sport: 'Basketball', distance: '3 km', startTime: '16:00' },
];

const QuickJoin = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const onSwipedRight = (index: number) => {
        const event = events[index];
        console.log(`Joined ${event.title}`);
    };

    const onSwipedLeft = (index: number) => {
        const event = events[index];
        console.log(`Skipped ${event.title}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Swiper
                cards={events}
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    swiperContainer: {
        flex: 1,
    },
});

export default QuickJoin;