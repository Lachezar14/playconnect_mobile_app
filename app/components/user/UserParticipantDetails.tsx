import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {FontAwesome} from "@expo/vector-icons";

interface UserParticipantDetailsProps {
    firstName: string;
    profilePicture: string;
    rating: number;
}

export const UserParticipantDetails: React.FC<UserParticipantDetailsProps> = ({firstName, rating, profilePicture}) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
            <Text style={styles.firstName}>{firstName}</Text>
            <View style={styles.ratingContainer}>
                <FontAwesome name="star" size={16} color="gold" />
                <Text style={styles.rating}>{rating}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        padding: 10,
    },
    profilePicture: {
        width: 60,
        height: 60,
        borderRadius: 40,
    },
    firstName: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "bold",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    rating: {
        marginLeft: 4,
        fontSize: 15,
        color: "#555",
    },
});
