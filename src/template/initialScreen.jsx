import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Initial = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const route = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                const onboarded = await AsyncStorage.getItem('onboarded');
                const jobOption = await AsyncStorage.getItem('jobOption');

                if (!onboarded) {
                    // Brand-new user — show onboarding/landing
                    navigation.reset({ index: 0, routes: [{ name: 'LandingScreen' }] });
                    return;
                }

                if (!userToken) {
                    // Returning user, logged out
                    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
                    return;
                }

                // Returning user, logged in
                if (jobOption === 'Employer' || jobOption === 'Investor') {
                    navigation.reset({ index: 0, routes: [{ name: 'RecruiterDash' }] });
                } else if (jobOption === 'placementDrive' || jobOption === 'Academy') {
                    navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'HomeScreen' }] });
                }
            } catch {
                navigation.reset({ index: 0, routes: [{ name: 'LandingScreen' }] });
            }
        };

        route();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#ffffff" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
});

export default Initial;
