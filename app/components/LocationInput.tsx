import React, {useEffect, useRef, useState} from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface LocationInputProps {
    setLocation: React.Dispatch<React.SetStateAction<Suggestion | null>>;
    resetQuery: boolean; // Change to boolean
    setShouldResetLocation: React.Dispatch<React.SetStateAction<boolean>>; // Add setter for reset flag
}

interface Suggestion {
    place_id: string;
    street: string;
    streetNumber: string;
    city: string;
    postcode: string;
    latitude: number;
    longitude: number;
}

const LocationInput: React.FC<LocationInputProps> = ({ setLocation, resetQuery, setShouldResetLocation }) => {
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    // Using useRef to store the timeout ID
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const fetchSuggestions = async (text: string) => {
        try {
            // Limited to the Netherlands, remove countrycodes=nl to search globally
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&countrycodes=nl&format=json&addressdetails=1&limit=5`
            );
            const data = await response.json();
            const formattedSuggestions = data.map((place: any) => ({
                place_id: place.place_id,
                street: place.address.road,
                streetNumber: place.address.house_number,
                city: place.address.city,
                postcode: place.address.postcode,
                latitude: place.lat,
                longitude: place.lon,
            }));
            setSuggestions(formattedSuggestions);
            console.log('Suggestions:', formattedSuggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleInputChange = (text: string) => {
        setQuery(text);

        // Clear the previous timeout to prevent an API call before the user stops typing
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (text.length > 2) {
            // Set a new timeout to call the fetchSuggestions after 3000ms = 3s of inactivity
            debounceTimeout.current = setTimeout(() => {
                fetchSuggestions(text);
            }, 3000);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionPress = (place: Suggestion) => {
        setQuery(`${place.street} ${place.streetNumber}, ${place.city} ${place.postcode}`);
        setLocation(place);  // Set the full location object in the parent component
        setSuggestions([]);
    };

    const clearInput = () => {
        setQuery(''); // Reset the input field
        setLocation(null); // Reset the location state
    };

    // Call resetQuery if it exists
    useEffect(() => {
        if (resetQuery) {
            setQuery(''); // Reset the input field
            setLocation(null); // Reset the location state
            setShouldResetLocation(false); // Reset the flag after clearing
        }
    }, [resetQuery, setLocation, setShouldResetLocation]);

    return (
        <View>
            <TextInput
                style={styles.input}
                value={query}
                onChangeText={handleInputChange}
                placeholder="Enter event location"
            />
            {suggestions.length > 0 && (
                <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item.place_id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                            <Text style={{ padding: 10 }}>{item.street} {item.streetNumber}, {item.city}, {item.postcode}</Text>
                        </TouchableOpacity>
                    )}
                    keyboardShouldPersistTaps="handled"
                    style={styles.suggestionList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 50,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        color: '#333',
    },
    suggestionList: {
        maxHeight: 200,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        borderColor: '#E5E7EB',
        borderWidth: 1,
    },
});

export default LocationInput;
