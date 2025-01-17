import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

const SkeletonEventCard = () => {
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
            <View style={styles.imageContainer}>
                <View style={styles.imageSkeleton} />
                <ShimmerEffect />
            </View>

            <View style={styles.details}>
                <View style={styles.titleContainer}>
                    <View style={styles.titleSkeleton} />
                    <ShimmerEffect />
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.iconSkeleton} />
                    <View style={styles.infoTextSkeleton} />
                    <ShimmerEffect />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        alignItems: 'flex-start',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        overflow: 'hidden',
    },
    imageSkeleton: {
        width: 90,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: '#E2E8F0',
    },
    details: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    titleContainer: {
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 2,
    },
    titleSkeleton: {
        height: 22,
        width: '80%',
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    iconSkeleton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        marginRight: 4,
    },
    infoTextSkeleton: {
        width: '40%',
        height: 15,
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

export default SkeletonEventCard;