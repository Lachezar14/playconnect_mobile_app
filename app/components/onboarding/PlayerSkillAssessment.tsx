import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

type Question = {
    id: number;
    question: string;
    options: string[];
    weight: number; // Adding weight property to questions
};

const questions: Question[] = [
    {
        id: 1,
        question: 'How many shots can you rally?',
        options: ['less than 5', '5-15', 'more than 15'],
        weight: 0.5, // Rally consistency is crucial for overall play
    },
    {
        id: 2,
        question: `How's your serve?`,
        options: ['Just get it over', 'Some power/spin', 'Confident with variety of shots'],
        weight: 0.25, // Serve is important but slightly less than rally ability
    },
    {
        id: 3,
        question: `How's your net play?`,
        options: ['Avoid the net', 'Basic volleys', 'Confident volleys/smashes'],
        weight: 0.1, // Net play is important but not as fundamental as rallying/serving
    },
    {
        id: 4,
        question: 'Can you hit slices, lobs, or drop shots?',
        options: ['No, only basics', 'Yes, if I have enough time', 'Yes, even under pressure'],
        weight: 0.15, // Special shots are advanced skills but not essential for beginners
    },
];

const calculateSkillLevel = (selectedAnswers: { [key: number]: number }): string => {
    let weightedScore = 0;
    let totalWeight = 0;

    questions.forEach(question => {
        const answerScore = selectedAnswers[question.id] || 0;
        weightedScore += (answerScore * question.weight);
        totalWeight += question.weight;
    });

    const percentage = (weightedScore / (3 * totalWeight)) * 100; // 3 is max score per question

    // Adjusted thresholds
    if (percentage <= 45) return 'Beginner';
    if (percentage <= 80) return 'Intermediate';
    return 'Advanced';
};

const PlayerSkillAssessment: React.FC<{ onSkillLevelSelect: (skill: string) => void }> = ({ onSkillLevelSelect }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

    const handleSelectOption = (questionId: number, optionIndex: number) => {
        setSelectedAnswers((prev) => {
            const updatedAnswers = { ...prev, [questionId]: optionIndex + 1 };
            const skillLevel = calculateSkillLevel(updatedAnswers);
            onSkillLevelSelect(skillLevel);
            return updatedAnswers;
        });
    };

    return (
        <ScrollView style={styles.container}>
            {questions.map((q) => (
                <View key={q.id} style={styles.section}>
                    <Text style={styles.heading}>{q.question}</Text>
                    <View style={styles.verticalCardContainer}>
                        {q.options.map((option, index) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.skillCardVertical,
                                    selectedAnswers[q.id] === index + 1 && styles.selectedSkillCard,
                                ]}
                                onPress={() => handleSelectOption(q.id, index)}
                            >
                                <Text
                                    style={[
                                        styles.skillStars,
                                        selectedAnswers[q.id] === index + 1 && styles.selectedSkillStars,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F7F8FA',
    },
    section: {
        marginBottom: 20,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    verticalCardContainer: {
        flexDirection: 'column',
    },
    skillCardVertical: {
        backgroundColor: '#E2E8F0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    selectedSkillCard: {
        backgroundColor: '#38A169',
    },
    skillStars: {
        fontSize: 16,
        color: '#333',
    },
    selectedSkillStars: {
        color: '#FFF',
    },
});

export default PlayerSkillAssessment;