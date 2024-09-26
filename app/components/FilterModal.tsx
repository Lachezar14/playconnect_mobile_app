import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Slider from '@react-native-community/slider';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApplyFilters: (filters: { sport: string; maxDistance: number }) => void;
    onResetFilters: () => void;
    initialFilters: { sport: string; maxDistance: number };
}

const sports = ['All', 'Football', 'Tennis', 'Basketball'];
const defaultFilters = { sport: 'All', maxDistance: 50 };

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApplyFilters, onResetFilters, initialFilters }) => {
    const [selectedSport, setSelectedSport] = useState(initialFilters.sport);
    const [maxDistance, setMaxDistance] = useState(initialFilters.maxDistance);

    useEffect(() => {
        setSelectedSport(initialFilters.sport);
        setMaxDistance(initialFilters.maxDistance);
    }, [initialFilters, visible]);

    const handleApplyFilters = () => {
        onApplyFilters({ sport: selectedSport, maxDistance });
        onClose();
    };

    const handleResetFilters = () => {
        setSelectedSport(defaultFilters.sport);
        setMaxDistance(defaultFilters.maxDistance);
        onResetFilters();
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Filter Events</Text>

                            <ScrollView style={styles.scrollView}>
                                <Text style={styles.sectionTitle}>Sport</Text>
                                {sports.map((sport) => (
                                    <TouchableOpacity
                                        key={sport}
                                        style={[
                                            styles.sportOption,
                                            selectedSport === sport && styles.selectedSportOption,
                                        ]}
                                        onPress={() => setSelectedSport(sport)}
                                    >
                                        <Text style={[
                                            styles.sportOptionText,
                                            selectedSport === sport && styles.selectedSportOptionText,
                                        ]}>
                                            {sport}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                <Text style={styles.sectionTitle}>Maximum Distance</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={1}
                                    maximumValue={50}
                                    step={1}
                                    value={maxDistance}
                                    onValueChange={setMaxDistance}
                                />
                                <Text style={styles.distanceText}>{maxDistance} km</Text>
                            </ScrollView>

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleResetFilters}>
                                    <Text style={styles.buttonText}>Reset Filters</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.applyButton]} onPress={handleApplyFilters}>
                                    <Text style={[styles.buttonText, styles.applyButtonText]}>Apply Filters</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    scrollView: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    sportOption: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f0f0f0',
    },
    selectedSportOption: {
        backgroundColor: 'green',
    },
    sportOptionText: {
        fontSize: 16,
    },
    selectedSportOptionText: {
        color: 'white',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    distanceText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    resetButton: {
        backgroundColor: '#f0f0f0',
    },
    applyButton: {
        backgroundColor: 'green',
    },
    buttonText: {
        fontSize: 16,
    },
    applyButtonText: {
        color: 'white',
    },
});

export default FilterModal;