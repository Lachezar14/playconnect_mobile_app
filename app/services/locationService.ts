import * as Location from 'expo-location';

export interface UserLocation {
    latitude: number;
    longitude: number;
}

export const getUserLocation = async (): Promise<UserLocation | null> => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return null;
        }

        let location = await Location.getCurrentPositionAsync({});
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.error("Error getting user location: ", error);
        return null;
    }
};