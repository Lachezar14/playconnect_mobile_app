import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const EventCardSmallSkeleton = () => {
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
        outputRange: [-100, 100],
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
            <View style={styles.image} />
            <View style={styles.details}>
                <View style={styles.titleSkeleton}>
                    <ShimmerEffect />
                </View>
                <View style={styles.infoRow}>
                    <View style={styles.iconSkeleton} />
                    <View style={styles.textSkeleton}>
                        <ShimmerEffect />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    image: {
        width: 120,
        height: 70,
        backgroundColor: '#E2E8F0',
        borderRadius: 8,
        marginRight: 10,
    },
    details: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    titleSkeleton: {
        width: '60%',
        height: 18,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    iconSkeleton: {
        width: 20,
        height: 20,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginRight: 4,
    },
    textSkeleton: {
        width: '40%',
        height: 14,
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

export default EventCardSmallSkeleton;
