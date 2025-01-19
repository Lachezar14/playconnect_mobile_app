import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Icons for search

interface FilterProps {
    onSearch: (title: string) => void;
}

const SearchFilter: React.FC<FilterProps> = ({ onSearch }) => {
    const [title, setTitle] = useState<string>('');

    const handleSearch = () => {
        onSearch(title);
    };

    return (
        <View style={styles.searchContainer}>
            {/* Search Bar with Search Icon */}
            <FontAwesome name="search" size={20} color="#6e6e6e" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Search events..."
                value={title}
                onChangeText={setTitle}
                onSubmitEditing={handleSearch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0', // Entire search bar is light grey
        borderRadius: 30,
        paddingHorizontal: 16,
        paddingVertical: 5,
        marginBottom: 16,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 18,
        backgroundColor: '#f0f0f0', // Matching the grey color for the input
        borderRadius: 25,
        paddingLeft: 10,
        color: '#666',
        fontWeight: '500',
    },
});

export default SearchFilter;
