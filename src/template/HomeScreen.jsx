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

const CACHED_VIDEOS_KEY = 'cachedVideos';

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
  // Custom comparison to ensure stability
  return prevProps.item.id === nextProps.item.id &&
    prevProps.onVideoPress === nextProps.onVideoPress;
});

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({ userId: null, firstName: '' });
  const [videos, setVideos] = useState([]);
  const videosRef = useRef([]); // Ref to hold videos for stable callbacks
  const [_profileImage, setProfileImage] = useState(null); // loaded for future use (e.g. avatar in hero)
  const [verificationStatus, setVerificationStatus] = useState(null);

  // --- Pagination and Refreshing State ---
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  // ✅ FIX: Added state for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  const VIDEO_PAGE_SIZE = 20;

  const fetchVideosFromServer = useCallback(async (currentPage, currentUserId) => {
    // This guard now correctly prevents fetches for subsequent pages when loading,
    // or when we know there is no more data.
    if ((currentPage > 0 && loadingMore) || !hasMoreData) return;

    // Use the appropriate loading indicator
    const loadingFunction = currentPage === 0 ? setIsLoading : setLoadingMore;
    if (!isRefreshing) {
      loadingFunction(true);
    }

    try {
      const response = await apiClient.get(`/api/videos/videos?page=${currentPage}&size=${VIDEO_PAGE_SIZE}`);
      const { videos: videoData, totalPages, currentPage: responseCurrentPage } = response.data;

      if (!Array.isArray(videoData)) throw new Error('Invalid data format');

      if (responseCurrentPage >= totalPages - 1 || videoData.length === 0) {
        setHasMoreData(false);
      }

      const formattedVideos = videoData
        .filter(video => video.userId !== currentUserId && video.thumbnail)
        .map(video => ({
          id: video.id,
          userId: video.userId,
          uri: video.videoUrl || video.uri,
          firstName: video.firstname || video.firstName || '',
          profileImage: video.profilepic,
          phoneNumber: video.phonenumber || video.phoneNumber || '',
          email: video.email || '',
          thumbnail: video.thumbnail || null,
          link: video.links || '',
        }));
      console.log("formatted video", formattedVideos);

      if (currentPage === 0) {
        setVideos(formattedVideos);
        await AsyncStorage.setItem(CACHED_VIDEOS_KEY, JSON.stringify(formattedVideos));
      } else {

        setVideos(prevVideos => {
          const newUniqueVideos = formattedVideos.filter(
            newVideo => !prevVideos.some(prevVideo => prevVideo.id === newVideo.id)
          );
          const updatedVideos = [...prevVideos, ...newUniqueVideos];
          AsyncStorage.setItem(CACHED_VIDEOS_KEY, JSON.stringify(updatedVideos));
          // Update ref
          videosRef.current = updatedVideos;
          return updatedVideos;
        });
      }

      // Update ref for page 0 case too
      if (currentPage === 0) {
        videosRef.current = formattedVideos;
      }

    } catch (err) {
      console.error('Error fetching videos from server:', err);
      setHasMoreData(false);
    } finally {
      if (!isRefreshing) {
        loadingFunction(false);
      }
    }
  }, [hasMoreData, loadingMore, isRefreshing]);

  // ✅ FIX: This useEffect now runs ONLY ONCE when the component mounts
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
        const cachedVideos = await AsyncStorage.getItem(CACHED_VIDEOS_KEY);
        if (cachedVideos) {
          const parsed = JSON.parse(cachedVideos);
          setVideos(parsed);
          videosRef.current = parsed;
        }
      } catch (error) {
        console.error("Error loading videos from cache:", error);
      }

      // Fetch fresh data for page 0 to ensure content isn't stale
      await fetchVideosFromServer(0, currentUser.userId);
      setIsLoading(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means it runs only once on mount


  // --- Handlers ---

  // ✅ FIX: Created a dedicated refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Reset pagination state and fetch the first page
    setPage(0);
    setHasMoreData(true);
    await fetchVideosFromServer(0, user.userId);
    setIsRefreshing(false);
  }, [user.userId, fetchVideosFromServer]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMoreData && !isRefreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideosFromServer(nextPage, user.userId);
    }
  };

  const handleVideoPress = useCallback((item, index) => {
    navigation.navigate('HomeSwipe', {
      videoId: item.id,
      index,
      allvideos: videosRef.current, // Use ref to avoid dependency on 'videos' state
    });
  }, [navigation]); // removed 'videos' dependency

  const renderItem = useCallback(({ item, index }) => (
    <VideoThumbnail
      item={item}
      index={index}
      onVideoPress={handleVideoPress}
    />
  ), [handleVideoPress]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={WZ.blue} />;
  };

  // --- Back Button Handler ---
  useEffect(() => {
    if (!isFocused) return;

    const backAction = () => {
      Alert.alert(
        "Go Back",
        "Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "YES", onPress: () => navigation.goBack() }
        ]
      );
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);

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
          <Text style={styles.heroWordmark}>wezume</Text>
          <View style={styles.heroIcons}>
            <TouchableOpacity style={styles.heroIconBtn}>
              <Text style={styles.heroIconText}>⚡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.heroIconBtn}>
              <Text style={styles.heroIconText}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>{user.firstName} 👋</Text>
        </View>
      </LinearGradient>

      {/* Cards section (overlapping hero) */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Verify Banner (shown only if pending) */}
        {verificationStatus === 'pending' && (
          <View style={styles.verifyBanner}>
            <Text style={styles.verifyBannerText}>
              Your account is pending verification.
            </Text>
          </View>
        )}

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

        {/* Discover section heading */}
        <View style={styles.discoverHeader}>
          <Text style={styles.discoverTitle}>Discover</Text>
          <TouchableOpacity>
            <Text style={styles.discoverSeeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Video grid */}
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={!isLoading && !isRefreshing ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No videos available right now.</Text>
              </View>
            ) : null}
            // ✅ FIX: Added props for pull-to-refresh
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
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
    height: 200,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  heroTopbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroWordmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroIcons: {
    flexDirection: 'row',
    alignItems: 'center',
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
  scrollArea: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  verifyBanner: {
    backgroundColor: WZ.amber,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginTop: 8,
  },
  verifyBannerText: {
    color: WZ.ink,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
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
  discoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  discoverTitle: {
    color: WZ.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  discoverSeeAll: {
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
