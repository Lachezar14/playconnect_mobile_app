import React, { useState, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface SportFilterProps {
    sports: string[];
    onSportSelect: (sport: string | null) => void;
    loading?: boolean;
}

const SportFilter: React.FC<SportFilterProps> = ({ sports, onSportSelect, loading = false }) => {
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [orderedSports, setOrderedSports] = useState<string[]>(sports);

    useEffect(() => {
        setOrderedSports(sports);
    }, [sports]);

    const handleSportPress = (sport: string) => {
        if (sport === 'All') {
            setSelectedSport(null);
            onSportSelect(null);
            setOrderedSports(['All', ...sports.filter(s => s !== 'All')]);
        } else if (selectedSport === sport) {
            setSelectedSport(null);
            onSportSelect(null);
            setOrderedSports(['All', ...sports.filter(s => s !== 'All')]);
        } else {
            setSelectedSport(sport);
            onSportSelect(sport);
            setOrderedSports([sport, 'All', ...sports.filter(s => s !== sport && s !== 'All')]);
        }
    };

    const renderSportButton = ({ item: sport }: { item: string }) => {
        const isSelected = selectedSport === sport || (sport === 'All' && selectedSport === null);

        return (
            <TouchableOpacity
                style={[
                    styles.sportButton,
                    isSelected && styles.selectedButton
                ]}
                onPress={() => handleSportPress(sport)}
            >
                <Text style={[styles.sportText, isSelected && styles.selectedText]}>
                    {sport}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderSkeletonButton = ({ item }: { item: number }) => (
        <Animated.View style={[styles.sportButton, styles.skeletonButton]}>
            <View style={styles.skeletonText} />
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={loading ? Array(5).fill(0) : orderedSports}
                renderItem={loading ? renderSkeletonButton : renderSportButton}
                keyExtractor={(item, index) => loading ? `skeleton-${index}` : item.toString()}
                showsHorizontalScrollIndicator={false}
                extraData={selectedSport}
            />
        </View>
    );
};

// Add these new styles
const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    sportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        marginHorizontal: 8,
        maxHeight: 40,
    },
    selectedButton: {
        backgroundColor: '#38A169',
    },
    sportText: {
        margin: -2,
        fontSize: 14,
        color: '#333',
    },
    selectedText: {
        color: '#FFF',
    },
    // New skeleton styles
    skeletonButton: {
        backgroundColor: '#F0F0F0',
        width: 80, // Fixed width for skeleton
        justifyContent: 'center',
    },
    skeletonText: {
        height: 14,
        width: '60%',
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
});

export default SportFilter;