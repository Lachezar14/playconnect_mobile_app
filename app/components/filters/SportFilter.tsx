import React, { useState, useEffect } from 'react';
import { Animated, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface SportFilterProps {
    sports: string[];
    onSportSelect: (sport: string | null) => void;
    loading?: boolean;
}

const iconMap: { [key: string]: string } = {
    Football: 'soccer',
    Tennis: 'tennis',
    Basketball: 'basketball',
    Padel: 'table-tennis',
};

const SportFilter: React.FC<SportFilterProps> = ({ sports, onSportSelect, loading = false }) => {
    const [selectedSport, setSelectedSport] = useState<string | null>(null);
    const [orderedSports, setOrderedSports] = useState<string[]>([]);

    useEffect(() => {
        // Filter out 'All' from sports array and set ordered sports
        setOrderedSports(sports.filter(sport => sport !== 'All'));
    }, [sports]);

    const handleSportPress = (sport: string) => {
        if (selectedSport === sport) {
            // Deselect the current sport to show all events
            setSelectedSport(null);
            onSportSelect(null);
        } else {
            // Select the new sport
            setSelectedSport(sport);
            onSportSelect(sport);
        }
    };

    const renderSportButton = ({ item: sport }: { item: string }) => {
        const isSelected = selectedSport === sport;

        return (
            <TouchableOpacity
                style={[
                    styles.sportButton,
                    isSelected && styles.selectedButton
                ]}
                onPress={() => handleSportPress(sport)}
            >
                <MaterialCommunityIcons
                    name={iconMap[sport] || 'help-circle-outline'}
                    size={18}
                    color={isSelected ? '#FFF' : '#666'}
                    style={styles.icon}
                />
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    sportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginHorizontal: 4,
        maxHeight: 40,
    },
    selectedButton: {
        backgroundColor: '#38A169',
    },
    sportText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    selectedText: {
        color: '#FFF',
    },
    icon: {
        marginRight: 4,
    },
    skeletonButton: {
        backgroundColor: '#F0F0F0',
        width: 80,
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