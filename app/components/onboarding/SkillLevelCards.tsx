import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const skillLevels = [
    { level: 'Advanced', stars: '★★★' },
    { level: 'Intermediate', stars: '★★' },
    { level: 'Beginner', stars: '★' },
];

interface SkillSelectionProps {
    selectedSkill: string;
    onSelectSkill: (skill: string) => void;
    selectedSport: string;
}

const SkillLevelCards: React.FC<SkillSelectionProps> = ({ selectedSkill, onSelectSkill, selectedSport }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.heading}>How good are you at {selectedSport}?</Text>
            <Text style={styles.subheading}>
                Tell us how good are you! Are you a pro, just a casual or new to the game?
            </Text>
            <View style={styles.verticalCardContainer}>
                {skillLevels.map((skill) => (
                    <TouchableOpacity
                        key={skill.level}
                        style={[
                            styles.skillCardVertical,
                            selectedSkill === skill.level && styles.selectedSkillCard,
                        ]}
                        onPress={() => onSelectSkill(skill.level)}
                    >
                        <Text
                            style={[
                                styles.skillStars,
                                selectedSkill === skill.level && styles.selectedSkillStars,
                            ]}
                        >
                            {skill.stars}
                        </Text>
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
    verticalCardContainer: {
        marginTop: 10,
    },
    skillCardVertical: {
        width: '100%',
        height: 80,
        borderRadius: 10,
        backgroundColor: '#f2f3f4',
        borderColor: '#e8eaec',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: 15,
    },
    selectedSkillCard: {
        borderColor: '#38A169',
    },
    skillStars: {
        fontSize: 36,
        color: '#FFD700',
    },
    selectedSkillStars: {
        color: '#FFB800',
    },
});

export default SkillLevelCards;