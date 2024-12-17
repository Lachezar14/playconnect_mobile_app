import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { Feather } from "@expo/vector-icons";

const sports = [
    { name: 'Football', image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=3149&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Tennis', image: 'https://plus.unsplash.com/premium_photo-1707486616740-65119f0a5942?q=80&w=2971&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Basketball', image: 'https://plus.unsplash.com/premium_photo-1685366454253-cb705836c5a8?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Padel', image: 'https://plus.unsplash.com/premium_photo-1708692919998-e3dc853ef8a8?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
];

interface SportSelectionProps {
    selectedSport: string;
    onSelectSport: (sport: string) => void;
}

const SportCards: React.FC<SportSelectionProps> = ({ selectedSport, onSelectSport }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.heading}>What do you like?</Text>
            <Text style={styles.subheading}>
                Choose the picture that best represents you and your interests!
            </Text>
            <View style={styles.cardContainer}>
                {sports.map((sport) => (
                    <TouchableOpacity
                        key={sport.name}
                        style={[
                            styles.card,
                            selectedSport === sport.name && styles.selectedCard,
                        ]}
                        onPress={() => onSelectSport(sport.name)}
                    >
                        <ImageBackground
                            source={{ uri: sport.image }}
                            style={styles.sportImage}
                        >
                            <View style={styles.imageOverlay}>
                                {selectedSport === sport.name && (
                                    <View style={styles.selectionCircle}>
                                        <Feather name="check" size={16} color="black" />
                                    </View>
                                )}
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: 8,
    },
    subheading: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 24,
    },
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    card: {
        width: '48%',
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        height: 200,
    },
    sportImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCard: {
        borderWidth: 4,
        borderColor: '#38A169',
    },
    selectionCircle: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 25,
        height: 25,
        borderRadius: 12.5,
        backgroundColor: '#d3d3d3',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#d3d3d3',
    },
});

export default SportCards;