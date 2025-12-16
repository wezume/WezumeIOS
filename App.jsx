import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import Initial from './src/template/initialScreen';
import LoginScreen from './src/template/LoginScreen';
import SignupScreen from './src/template/SignupScreen';
import HomeScreen from './src/template/HomeScreen';
import home1 from './src/template/home1';
import OnboardingScreen from './src/template/onboarding';
import CameraScreen from './src/template/camera';
import Profile from './src/template/Profile';
import Transcribe from './src/template/transcribe';
import Account from './src/template/account';
import LikeScreen from './src/template/likedvideo';
import Edit from './src/template/Edit';
import Filtered from './src/template/filterd';
import Trending from './src/template/trending';
import Myvideos from './src/template/myvideos';
import ForgetPassword from './src/template/forgetpassword';
import VideoScreen from './src/template/VideoScreen';
import HomeSwipe from './src/template/homeSwipe';
import LikeSwipe from './src/template/likeSwipe';
import TrendSwipe from './src/template/trendSwipe';
import MySwipe from './src/template/mySwipe.jsx';
import AnalyticScreen from './src/template/Analytics';
import FilterSwipe from './src/template/filterSwipe';
import ScoringScreen from './src/template/scoring';
import AppUpdateChecker from './src/template/AppUpdateChecker';
import RecruiterDash from './src/template/Recruiterdahs.jsx';
import PlacemenntSignup from './src/template/placementSignup.jsx';
import RoleSelection from './src/template/roleSelection';
import RoleSwipe from './src/template/roleSwipe';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useRef(null); // ✅ Correct way to use navigation reference
  useEffect(() => {

    //     const clearAsyncStorage = async () => {
    //     try {
    //         await AsyncStorage.clear();
    //         console.log("All data cleared from AsyncStorage");
    //     } catch (error) {
    //         console.error("Error clearing AsyncStorage", error);
    //     }
    // };

    /** ✅ Create notification channel */
    const createNotificationChannel = async () => {
      try {
        console.log('Creating notification channel for the owner...');
        await notifee.createChannel({
          id: 'owner-channel',
          name: 'Owner Notifications',
          importance: 4, // High priority for immediate attention
          sound: 'default',
          vibrate: true,
        });
        console.log('Owner channel created successfully!');
      } catch (error) {
        console.error('Error creating owner notification channel:', error);
      }
    };

    /** ✅ Request Permission for notification */
    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs access to send you notifications.',
              buttonPositive: 'OK',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permissions granted.');
          } else {
            console.warn('Notification permissions denied.');
          }
        } else if (Platform.OS === 'ios') {
          const settings = await notifee.requestPermission();
          if (settings.authorizationStatus >= 1) {
            console.log('Notification permissions granted.');
          } else {
            console.warn('Notification permissions denied.');
          }
        }
      } catch (error) {
        console.error('Failed to request notification permissions:', error);
      }
    };
    // clearAsyncStorage(); // Clear AsyncStorage for testing purposes
    requestNotificationPermission();
    createNotificationChannel();

    /** ✅ Handle deep link navigation */
    const handleDeepLink = event => {
      console.log('Received deep link:', event.url);
      if (event.url) {
        handleURLNavigation(event.url);
      }
    };

    // ✅ Use the new approach
    const linkingListener = Linking.addEventListener('url', handleDeepLink);

    // ✅ Get the initial URL when app is launched from a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('App opened with URL:', url);
        handleURLNavigation(url); // ✅ Call handleURLNavigation with the initial URL
      }
    });

    return () => {
      linkingListener.remove(); // ✅ Clean up listener on unmount
    };
  }, []);

  /** ✅ Function to handle deep link navigation */
  const handleURLNavigation = (url) => {
    try {
      // NOTE: navigationRef is now accessed from the parent component's scope (closure).
      // A safety check ensures we only proceed if navigationRef exists.
      if (typeof navigationRef === 'undefined' || navigationRef === null) {
        console.error('❌ FATAL ERROR: navigationRef is not accessible in this scope.');
        return;
      }

      let urlToProcess = url;

      // --- STEP 1: Handle External URL with 'target' parameter ---
      // This addresses URLs like: https://app.wezume.in/...share?target=app://...
      if (url.startsWith('http') && url.includes('?target=')) {
        // Split the URL to isolate the value of the 'target' parameter
        // (Using basic string manipulation as URL API might not be available in all RN environments)
        const urlParts = url.split('?target=');
        if (urlParts.length > 1) {
          // The deep link is everything after '?target='
          urlToProcess = urlParts[1];
          console.log(`[Extractor] Deep link extracted from target: ${urlToProcess}`);
        } else {
          console.error('❌ Could not parse deep link from target parameter.');
          return;
        }
      }
      // --- End Step 1 ---


      // --- STEP 2: Process the internal deep link (app://api/videos/user/...) ---

      // Ensure the link to process has the app:// prefix
      if (!urlToProcess.startsWith('app://')) {
        console.error('❌ Final URL to process does not start with app://', urlToProcess);
        return;
      }

      const route = urlToProcess.replace('app://', ''); // Extract route
      const parts = route.split('/');

      // Check if the structure matches the expected pattern: api/videos/user/.../...
      if (
        parts.length >= 5 &&
        parts[0] === 'api' &&
        parts[1] === 'videos' &&
        parts[2] === 'user'
      ) {
        // The video URL includes the 'https://' scheme and is composed of parts[3] 
        // up to the second-to-last part (which is the video ID).
        const videoUrl = parts.slice(3, -1).join('/');
        const videoId = parts[parts.length - 1]; // Extract video ID

        console.log(`Navigating to VideoScreen with video URL: ${videoUrl} and video ID: ${videoId}`);

        if (navigationRef.current) {
          console.log('✅ Navigation triggered! Applying 300ms delay to ensure stack stability.');

          // FIX: Apply a short delay to overcome navigation race conditions 
          // that happen when deep links are processed before the navigation stack is fully ready.
          setTimeout(() => {
            navigationRef.current.navigate('VideoScreen', { videoUrl, videoId });
          }, 300);

        } else {
          // This means the NavigationContainer ref is null.
          console.error('❌ Navigation reference is not initialized yet.');
        }
      } else {
        console.error('❌ URL format does not match expected pattern (api/videos/user/...).');
      }
    } catch (error) {
      console.error('❌ Error processing deep link:', error);
    }
  };

  return (
    <GestureHandlerRootView>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Initial" component={Initial} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="home1" component={home1} />
          <Stack.Screen name="CameraPage" component={CameraScreen} />
          <Stack.Screen name="profile" component={Profile} />
          <Stack.Screen name="Transcribe" component={Transcribe} />
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="LikeScreen" component={LikeScreen} />
          <Stack.Screen name="Filtered" component={Filtered} />
          <Stack.Screen name="Edit" component={Edit} />
          <Stack.Screen name="Trending" component={Trending} />
          <Stack.Screen name="Myvideos" component={Myvideos} />
          <Stack.Screen name="ForgetPassword" component={ForgetPassword} />
          <Stack.Screen name="VideoScreen" component={VideoScreen} />
          <Stack.Screen name="HomeSwipe" component={HomeSwipe} />
          <Stack.Screen name="MySwipe" component={MySwipe} />
          <Stack.Screen name="FilterSwipe" component={FilterSwipe} />
          <Stack.Screen name="TrendSwipe" component={TrendSwipe} />
          <Stack.Screen name="LikeSwipe" component={LikeSwipe} />
          <Stack.Screen name="ScoringScreen" component={ScoringScreen} />
          <Stack.Screen name="AnalyticScreen" component={AnalyticScreen} />
          <Stack.Screen name="PlacemenntSignup" component={PlacemenntSignup} />
          <Stack.Screen name="RoleSelection" component={RoleSelection} />
          <Stack.Screen name="RoleSwipe" component={RoleSwipe} />
          <Stack.Screen name="RecruiterDash" component={RecruiterDash} />
        </Stack.Navigator>
      </NavigationContainer>
      <AppUpdateChecker />
    </GestureHandlerRootView>
  );
};

export default App;
