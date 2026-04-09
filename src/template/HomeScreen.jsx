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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import Header from './header';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

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
  const [profileImage, setProfileImage] = useState(null);

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

      if (!userId) {
        navigation.replace('LoginScreen');
        return;
      }
      const currentUser = { firstName, userId };
      setUser(currentUser);
      setProfileImage(profilePic);

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
    return <ActivityIndicator style={{ marginVertical: 20 }} size="large" color="#ffffff" />;
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


  return (
    <View style={styles.container}>
      <Header userName={user.firstName} profile={profileImage} />
      <ImageBackground source={require('./assets/login.jpg')} style={styles.imageBackground}>
        {isLoading && videos.length === 0 ? (
          <ActivityIndicator size="large" color="#ffffff" />
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
          />
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 25,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
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
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
  },
});

export default HomeScreen;