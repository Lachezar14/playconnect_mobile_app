import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface SportFilterProps {
    sports: string[];
    onSportSelect: (sport: string | null) => void;
}

const SportFilter: React.FC<SportFilterProps> = ({ sports, onSportSelect }) => {
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

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                data={orderedSports}
                renderItem={renderSportButton}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                extraData={selectedSport}
            />
        </View>
    );
};

export default SportFilter;

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
});