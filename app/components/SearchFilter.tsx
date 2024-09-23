import React, { useState } from 'react';
import { View, TextInput, Button, Modal, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome, Feather } from '@expo/vector-icons'; // Icons for search and filter

interface FilterProps {
    onSearch: (title: string) => void;
    onFilterApply: (startDate: string, endDate: string) => void;
}

const SearchFilter: React.FC<FilterProps> = ({ onSearch, onFilterApply }) => {
    const [title, setTitle] = useState<string>('');
    //const [sport, setSport] = useState<string>('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState<boolean>(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

    const handleSearch = () => {
        onSearch(title);
    };

    const handleFilterApply = () => {
        const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
        const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';
        onFilterApply(formattedStartDate, formattedEndDate);
        setFilterModalVisible(false); // Close the modal after applying filters
    };

    // Handle Date Picker change for both platforms
    const onChangeStartDate = (event: any, selectedDate: Date | undefined) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onChangeEndDate = (event: any, selectedDate: Date | undefined) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    // Reset function
    const resetFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setFilterModalVisible(false);
    };

    return (
        <View>
            {/* Search Bar with Search Icon and Filter Button */}
            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#6e6e6e" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search listings..."
                    value={title}
                    onChangeText={setTitle}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
                    <Feather name="sliders" size={20} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Modal for Filters */}
            <Modal
                visible={filterModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Apply Filters</Text>

                        {/* Start Date Picker */}
                        <TouchableOpacity
                            onPress={() => setShowStartDatePicker(true)}
                            style={styles.dateButton}
                        >
                            <Text style={styles.dateButtonText}>
                                {startDate ? startDate.toDateString() : 'Select Start Date'}
                            </Text>
                        </TouchableOpacity>
                        {showStartDatePicker && (
                            <DateTimePicker
                                value={startDate || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={onChangeStartDate}
                                minimumDate={new Date()} // Optional: Set max date as today or later
                            />
                        )}

                        {/* End Date Picker */}
                        <TouchableOpacity
                            onPress={() => setShowEndDatePicker(true)}
                            style={styles.dateButton}
                        >
                            <Text style={styles.dateButtonText}>
                                {endDate ? endDate.toDateString() : 'Select End Date'}
                            </Text>
                        </TouchableOpacity>
                        {showEndDatePicker && (
                            <DateTimePicker
                                value={endDate || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={onChangeEndDate}
                                minimumDate={new Date()} // Optional: Set max date as today or later
                            />
                        )}

                        <TouchableOpacity style={styles.applyButton} onPress={handleFilterApply}>
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeButton} onPress={resetFilters}>
                            <Text style={styles.closeButtonText}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setFilterModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 16,
    },
    icon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        height: 40,
        paddingLeft: 10,
    },
    filterButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 20,
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 30,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    dateButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    dateButtonText: {
        color: '#333',
    },
    applyButton: {
        backgroundColor: '#38A169',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#e0e0e0',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#333',
    },
});

export default SearchFilter;
