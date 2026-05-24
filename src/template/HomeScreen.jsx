import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  ActivityIndicator,
  Platform,
  StatusBar,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const WZ = {
  blue: '#1E9BD7', blueDeep: '#0E5A8E', navy: '#0B2138', navySoft: '#1A2F47',
  midnight: '#03152A', yellow: '#FFC93A', green: '#2CC6A1', coral: '#FF6B6B',
  amber: '#FFB020', ink: '#0B1623', ink2: '#4A5A70', ink3: '#8B97A8',
  line: '#E5ECF3', bg: '#F4F8FC', card: '#FFFFFF',
};

const CACHED_MY_VIDEO_KEY = 'cachedMyVideo';

// --- Memoized and Animated Video Item ---
const VideoThumbnail = memo(({ item, index, onVideoPress }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 50, withTiming(1));
    opacity.value = withDelay(index * 50, withTiming(1));
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.videoItemContainer, animatedStyle]}>
      <TouchableOpacity onPress={() => onVideoPress(item, index)} style={styles.videoItem}>
        {item.thumbnail ? (
          <ImageBackground
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noThumbnailView}>
            <Text style={styles.noThumbnailText}>No Thumbnail</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
    prevProps.onVideoPress === nextProps.onVideoPress;
});

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ userId: null, firstName: '' });
  const [videos, setVideos] = useState([]);
  const videosRef = useRef([]);
  const [_profileImage, setProfileImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [resendSent, setResendSent] = useState(false);

  const refreshVerificationStatus = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/user-detail');
      const status = res.data?.verification_status ?? null;
      if (status) {
        setVerificationStatus(status);
        await AsyncStorage.setItem('verification_status', String(status));
      }
    } catch (_) {}
  }, []);

  const handleResendVerification = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      await apiClient.post('/api/users/resend-verification', { email });
      setResendSent(true);
      Alert.alert('Email sent', 'Check your inbox for the verification link.');
    } catch (_) {
      Alert.alert('Error', 'Could not send verification email. Please try again.');
    }
  }, []);

  const fetchMyVideos = useCallback(async (userId) => {
    try {
      const response = await apiClient.get(`/api/videos/user/${userId}`);
      const video = response.data;
      if (video && video.id) {
        const formatted = [{
          id: video.id,
          userId: video.userId,
          uri: video.videoUrl || video.uri,
          firstName: video.firstname || video.firstName || '',
          profileImage: video.profilepic,
          phoneNumber: video.phonenumber || video.phoneNumber || '',
          email: video.email || '',
          thumbnail: video.thumbnail || null,
          link: video.links || '',
        }];
        setVideos(formatted);
        videosRef.current = formatted;
        await AsyncStorage.setItem(CACHED_MY_VIDEO_KEY, JSON.stringify(formatted));
      } else {
        setVideos([]);
        videosRef.current = [];
      }
    } catch (err) {
      console.error('Error fetching my videos:', err);
    }
  }, []);

  useEffect(() => {
    if (isFocused) refreshVerificationStatus();
  }, [isFocused, refreshVerificationStatus]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const firstName = await AsyncStorage.getItem('firstName');
      const userIdStr = await AsyncStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      const profilePic = await AsyncStorage.getItem('profileUrl');
      const verStatus = await AsyncStorage.getItem('verification_status');

      if (!userId) {
        navigation.replace('LoginScreen');
        return;
      }
      const currentUser = { firstName, userId };
      setUser(currentUser);
      setProfileImage(profilePic);
      setVerificationStatus(verStatus);

      try {
        const cached = await AsyncStorage.getItem(CACHED_MY_VIDEO_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setVideos(parsed);
          videosRef.current = parsed;
        }
      } catch (error) {
        console.error('Error loading cached video:', error);
      }

      await fetchMyVideos(userId);
      setIsLoading(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVideoPress = useCallback((item, index) => {
    navigation.navigate('HomeSwipe', {
      videoId: item.id,
      index,
      allvideos: videosRef.current,
    });
  }, [navigation]);

  const renderItem = useCallback(({ item, index }) => (
    <VideoThumbnail
      item={item}
      index={index}
      onVideoPress={handleVideoPress}
    />
  ), [handleVideoPress]);

  // --- Back Button Handler ---
  useEffect(() => {
    if (!isFocused) return;

    const backAction = () => {
      Alert.alert(
        'Go Back',
        'Are you sure you want to go back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'YES', onPress: () => navigation.goBack() },
        ]
      );
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => subscription.remove();
  }, [isFocused, navigation]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'good morning';
    if (hour < 17) return 'good afternoon';
    return 'good evening';
  };

  return (
    <View style={styles.container}>
      {/* Hero band */}
      <LinearGradient
        colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']}
        style={styles.heroBand}>
        {/* Topbar row */}
        <View style={styles.heroTopbar}>
          <Image
            source={require('../assets/brand/wezume-wordmark-trimmed.png')}
            style={styles.wordmark}
            resizeMode="contain"
            tintColor="#fff"
          />
          <TouchableOpacity style={styles.heroIconBtn}>
            <Text style={styles.heroIconText}>☰</Text>
          </TouchableOpacity>
        </View>
        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingName}>{user.firstName} 👋</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Edit')}
              activeOpacity={0.7}
              style={styles.editProfileBtn}
            >
              <Text style={styles.editProfileText}>update profile →</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Verify pill */}
        {verificationStatus === 'verified' ? (
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedPillText}>✓ email verified</Text>
          </View>
        ) : verificationStatus === 'pending' ? (
          <TouchableOpacity
            style={[styles.verifyPill, resendSent && styles.verifyPillSent]}
            onPress={handleResendVerification}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyPillText}>
              {resendSent ? '✉ email sent · resend' : '✉ verify your email →'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </LinearGradient>

      {/* Cards section (overlapping hero) */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* AI Review headline card */}
        <View style={styles.aiReviewCard}>
          <Text style={styles.aiReviewLabel}>LATEST AI REVIEW</Text>
          <Text style={styles.aiReviewHeadline}>
            Record your first take to see your AI review.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('home1')}>
            <Text style={styles.aiReviewCta}>See full review →</Text>
          </TouchableOpacity>
        </View>

        {/* AI Coach card */}
        <LinearGradient
          colors={[WZ.navy, WZ.navySoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiCoachCard}>
          <Text style={styles.aiCoachLabel}>AI COACH</Text>
          <Text style={styles.aiCoachTip}>
            Record a take and get instant AI coaching.
          </Text>
          <TouchableOpacity
            style={styles.aiCoachBtn}
            onPress={() => navigation.navigate('CameraPage')}>
            <Text style={styles.aiCoachBtnText}>Start take →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* My Takes section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Takes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CameraPage')}>
            <Text style={styles.sectionCta}>+ Record</Text>
          </TouchableOpacity>
        </View>

        {isLoading && videos.length === 0 ? (
          <ActivityIndicator size="large" color={WZ.blue} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={videos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={21}
            ListEmptyComponent={!isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No takes yet. Hit record to start.</Text>
              </View>
            ) : null}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* Floating Record FAB */}
      <TouchableOpacity
        style={styles.fabWrap}
        onPress={() => navigation.navigate('CameraPage')}
        activeOpacity={0.85}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E58']}
          style={styles.fab}>
          <Text style={styles.fabIcon}>●</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WZ.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heroBand: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  heroTopbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  wordmark: {
    height: 36,
    width: 126,
  },
  heroIconBtn: {
    marginLeft: 14,
  },
  heroIconText: {
    fontSize: 20,
    color: '#fff',
  },
  greetingWrap: {
    marginTop: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editProfileBtn: {
    paddingVertical: 2,
  },
  editProfileText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 11,
    fontWeight: '600',
  },
  greetingSmall: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12,
    fontWeight: '400',
    textTransform: 'lowercase',
    marginBottom: 2,
  },
  greetingName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  verifyPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#8B1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  verifyPillSent: {
    backgroundColor: '#6B4C00',
  },
  verifyPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(44,198,161,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(44,198,161,0.55)',
  },
  verifiedPillText: {
    color: '#2CC6A1',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  aiReviewCard: {
    backgroundColor: WZ.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  aiReviewLabel: {
    color: WZ.blue,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  aiReviewHeadline: {
    color: WZ.ink,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 24,
  },
  aiReviewCta: {
    color: WZ.blue,
    fontSize: 12,
    fontWeight: '700',
  },
  aiCoachCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'column',
  },
  aiCoachLabel: {
    color: WZ.yellow,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  aiCoachTip: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    lineHeight: 20,
  },
  aiCoachBtn: {
    backgroundColor: WZ.yellow,
    borderRadius: 10,
    height: 28,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  aiCoachBtnText: {
    color: WZ.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: WZ.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCta: {
    color: WZ.blue,
    fontSize: 13,
    fontWeight: '600',
  },
  videoItemContainer: {
    flex: 1 / 4,
    aspectRatio: 9 / 16,
    padding: 1,
  },
  videoItem: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  thumbnail: {
    flex: 1,
  },
  noThumbnailView: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noThumbnailText: {
    color: '#888',
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: WZ.ink2,
    fontSize: 16,
  },
  fabWrap: {
    position: 'absolute',
    bottom: 90,
    right: 18,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});

export default HomeScreen;
