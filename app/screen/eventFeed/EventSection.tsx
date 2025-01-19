import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {FlatList, View, StyleSheet, Text, TouchableOpacity} from "react-native";
import EventCardSearch from "../../components/event/EventCardSearch";
import {MaterialCommunityIcons} from "@expo/vector-icons";

const EventSection = ({ route, navigation }: { route: any; navigation: any }) => {
    const { title, events } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header with X Button */}
            <View style={styles.header}>
                <Text style={styles.pageTitle}>{title}</Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialCommunityIcons name="close" size={28} color="#333" />
                </TouchableOpacity>
            </View>
            {/* Events List */}
            <FlatList
                data={events}
                renderItem={({ item }) => <EventCardSearch event={item} targetPage="EventDetails" />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.verticalList}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    verticalList: {
        padding: 16,
    },
});

export default EventSection;