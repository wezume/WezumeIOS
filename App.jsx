import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking, PermissionsAndroid, Platform, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './src/template/api';

// Import Screens
import Initial from './src/template/initialScreen';
import LoginScreen from './src/template/LoginScreen';
import SignupScreen from './src/template/SignupScreen';
import MainTabs from './src/template/MainTabs';
import home1 from './src/template/home1';
import OnboardingScreen from './src/template/onboarding';
import CameraScreen from './src/template/camera';
import Profile from './src/template/Profile';
import Transcribe from './src/template/transcribe';
import Account from './src/template/account';
import LikeScreen from './src/template/likedvideo';
import Edit from './src/template/Edit';
import EditProfileScreen from './src/template/EditProfileScreen';
import Filtered from './src/template/filterd';
import NotificationsScreen from './src/template/NotificationsScreen';
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
import Test from './src/template/test.jsx';
import LandingScreen from './src/template/LandingScreen';
import RoleSelectScreen from './src/template/RoleSelectScreen';
import DetailsScreen from './src/template/DetailsScreen';
import SuccessScreen from './src/template/SuccessScreen';
import { OnboardingProvider } from './src/template/OnboardingContext';
import MyVideoScreen from './src/template/MyVideoScreen';
import DiscoverScreen from './src/template/DiscoverScreen';
const Stack = createNativeStackNavigator();

const App = () => {
  const navigationRef = useRef(null);
  const [transcriptBanner, setTranscriptBanner] = useState(null); // { videoId } or null
  const transcriptPollRef = useRef(null);
  const bannerTimerRef    = useRef(null);

  useEffect(() => {
    /** ✅ Create notification channel */
    const createNotificationChannel = async () => {
      try {
        await notifee.createChannel({
          id: 'owner-channel',
          name: 'Owner Notifications',
          importance: 4,
          sound: 'default',
          vibrate: true,
        });
      } catch (error) {
        console.error('Error creating owner notification channel:', error);
      }
    };

    /** ✅ Request Permission for notification */
    const requestNotificationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs access to send you notifications.',
              buttonPositive: 'OK',
            },
          );
        } else if (Platform.OS === 'ios') {
          await notifee.requestPermission();
        }
      } catch (error) {
        console.error('Failed to request notification permissions:', error);
      }
    };

    requestNotificationPermission();
    createNotificationChannel();

    /** ✅ Handle deep link navigation */
    const handleDeepLink = event => {
      if (event.url) handleURLNavigation(event.url);
    };

    const linkingListener = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => { if (url) handleURLNavigation(url); });

    return () => linkingListener.remove();
  }, []);

  // ── Transcript-ready banner polling ──────────────────────────────────────────
  // Shows a dismissable banner the first time status transitions to SCORING
  // (meaning transcription just completed). Tapping opens the Transcribe screen.
  useEffect(() => {
    const poll = async () => {
      try {
        const raw = await AsyncStorage.getItem('pendingVideoProcessing');
        if (!raw) return;
        const stored = JSON.parse(raw);
        const { videoId, status: storedStatus } = stored;
        if (!videoId) return;

        const res = await apiClient.get(`/api/videos/processing-status/${videoId}`);
        const { status } = res.data;

        // Transcript just completed → show banner once
        if (status === 'SCORING' && storedStatus === 'PROCESSING') {
          await AsyncStorage.setItem('pendingVideoProcessing', JSON.stringify({ videoId, status: 'SCORING' }));
          const currentRoute = navigationRef.current?.getCurrentRoute?.()?.name;
          if (currentRoute !== 'Transcribe') {
            showBanner(videoId);
          }
        } else if (status === 'READY' || status === 'ERROR') {
          dismissBanner();
          await AsyncStorage.removeItem('pendingVideoProcessing');
        }
      } catch (_) {}
    };

    transcriptPollRef.current = setInterval(poll, 8000);
    return () => clearInterval(transcriptPollRef.current);
  }, []);

  const showBanner = (videoId) => {
    setTranscriptBanner({ videoId });
    clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(dismissBanner, 8000); // auto-dismiss after 8s
  };

  const dismissBanner = () => {
    clearTimeout(bannerTimerRef.current);
    setTranscriptBanner(null);
  };

  const handleBannerTap = () => {
    const data = transcriptBanner;
    dismissBanner();
    if (navigationRef.current && data) {
      navigationRef.current.navigate('Transcribe', { videoId: data.videoId });
    }
  };

  /** ✅ Function to handle deep link navigation */
  const handleURLNavigation = (url) => {
    try {
      if (typeof navigationRef === 'undefined' || navigationRef === null) return;

      let urlToProcess = url;

      if (url.startsWith('http') && url.includes('?target=')) {
        const urlParts = url.split('?target=');
        if (urlParts.length > 1) {
          urlToProcess = urlParts[1];
        } else {
          return;
        }
      }

      if (!urlToProcess.startsWith('app://')) return;

      const route = urlToProcess.replace('app://', '');
      const parts = route.split('/');

      if (
        parts.length >= 5 &&
        parts[0] === 'api' &&
        parts[1] === 'videos' &&
        parts[2] === 'user'
      ) {
        const videoUrl = parts.slice(3, -1).join('/');
        const videoId = parts[parts.length - 1];
        if (navigationRef.current) {
          setTimeout(() => {
            navigationRef.current.navigate('VideoScreen', { videoUrl, videoId });
          }, 300);
        }
      }
    } catch (error) {
      console.error('❌ Error processing deep link:', error);
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <OnboardingProvider>
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Initial" component={Initial} />
              <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="SignupScreen" component={SignupScreen} />
              <Stack.Screen name="HomeScreen" component={MainTabs} />
              <Stack.Screen name="home1" component={home1} />
              <Stack.Screen name="CameraPage" component={CameraScreen} />
              <Stack.Screen name="profile" component={Profile} />
              <Stack.Screen name="Transcribe" component={Transcribe} />
              <Stack.Screen name="Account" component={Account} />
              <Stack.Screen name="LikeScreen" component={LikeScreen} />
              <Stack.Screen name="Filtered" component={Filtered} />
              <Stack.Screen name="Edit" component={Edit} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
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
              <Stack.Screen name="Test" component={Test} />
              <Stack.Screen name="LandingScreen" component={LandingScreen} />
              <Stack.Screen name="RoleSelectScreen" component={RoleSelectScreen} />
              <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
              <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
              <Stack.Screen name="MyVideoScreen" component={MyVideoScreen} />
              <Stack.Screen name="RecruiterDiscover" component={DiscoverScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </OnboardingProvider>
      </SafeAreaProvider>
      <AppUpdateChecker />

      {/* Non-blocking transcript-ready banner */}
      {!!transcriptBanner && (
        <TouchableOpacity
          style={appStyles.banner}
          onPress={handleBannerTap}
          activeOpacity={0.92}>
          <View style={appStyles.bannerContent}>
            <Text style={appStyles.bannerEmoji}>🎙️</Text>
            <View style={appStyles.bannerTextWrap}>
              <Text style={appStyles.bannerTitle}>Transcript ready!</Text>
              <Text style={appStyles.bannerSub}>Tap to review before sharing</Text>
            </View>
          </View>
          <TouchableOpacity onPress={dismissBanner} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={appStyles.bannerClose}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
};

const appStyles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 16, right: 16,
    backgroundColor: '#0F2438',
    borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,201,58,0.30)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 10,
  },
  bannerContent:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bannerEmoji:    { fontSize: 24, marginRight: 12 },
  bannerTextWrap: { flex: 1 },
  bannerTitle:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  bannerSub:      { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
  bannerClose:    { color: 'rgba(255,255,255,0.45)', fontSize: 16, fontWeight: '600', paddingLeft: 8 },
});

export default App;
