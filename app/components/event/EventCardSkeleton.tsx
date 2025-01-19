import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const EventCardSkeleton = () => {
    // Animation value for the shimmer effect
    const shimmerValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startShimmerAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerValue, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerValue, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startShimmerAnimation();
    }, []);

    const shimmerTranslate = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    const ShimmerEffect = () => (
        <Animated.View
            style={[
                styles.shimmer,
                {
                    transform: [{ translateX: shimmerTranslate }],
                },
            ]}
        />
    );

    return (
        <View style={styles.card}>
            <View style={styles.imageContainer}>
                <View style={styles.imageSkeleton} />
                <ShimmerEffect />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.titleSkeleton} />
                <View style={styles.row}>
                    <View style={styles.timeSkeleton} />
                    <View style={styles.distanceSkeleton} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
    },
    imageContainer: {
        width: '100%',
        height: 120,
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
        borderRadius: 8,
    },
    imageSkeleton: {
        width: '100%',
        height: '100%',
        backgroundColor: '#E2E8F0',
    },
    contentContainer: {
        marginTop: 8,
        backgroundColor: '#fff',
    },
    titleSkeleton: {
        height: 20,
        width: '70%',
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeSkeleton: {
        height: 14,
        width: '40%',
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
    distanceSkeleton: {
        height: 14,
        width: '25%',
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff50',
    },
});

export default EventCardSkeleton;
