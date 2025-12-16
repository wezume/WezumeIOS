import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  Text,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import Header from "./header";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./api";

/* -------------------- VIDEO THUMBNAIL -------------------- */
const VideoThumbnail = memo(({ item, index, onPress }) => {
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
      <TouchableOpacity onPress={onPress} style={styles.videoItem}>
        {item.thumbnail ? (
          <ImageBackground
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          >
            {/* ⭐ CONFIDENCE WATERMARK */}
            {item.confidence != null && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{item.confidence}%</Text>
              </View>
            )}
          </ImageBackground>
        ) : (
          <View style={styles.noThumbnailView}>
            <Text style={styles.noThumbnailText}>No Thumbnail</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});


/* -------------------- MAIN SCREEN -------------------- */
const FilteredVideosScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // These can come from two sources:
  const passedVideos = route.params?.videos || null;
  const filterCriteria = route.params?.filterCriteria || null;

  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState({ firstName: "" });
  const [profileImage, setProfileImage] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const VIDEO_PAGE_SIZE = 20;

  /* -------------------- FORMAT VIDEO OBJECTS -------------------- */
  const formatVideos = (list) =>
    list
      ?.filter((video) => video.thumbnail)
      .map((video) => ({
        id: video.id,
        userId: video.userId,
        uri: video.videoUrl || video.uri,
        firstName: video.firstname || video.firstName || "",
        profileImage: video.profilePic || null,
        phoneNumber: video.phoneNumber || video.phonenumber || "",
        email: video.email || "",
        thumbnail: video.thumbnail || null,
        confidence: video.confidence ?? null,
      })) || [];

  /* -------------------- FETCH FROM API WHEN USING FILTERS -------------------- */
  const fetchFilteredVideos = useCallback(
    async (currentPage, filters) => {
      const loader = currentPage === 0 ? setIsLoading : setLoadingMore;
      loader(true);

      try {
        const payload = { ...filters, page: currentPage, size: VIDEO_PAGE_SIZE };
        const response = await apiClient.post("/api/videos/filter", payload);

        const newVideos = Array.isArray(response.data?.videos)
          ? response.data.videos
          : response.data;

        const formatted = formatVideos(newVideos);

        if (currentPage === 0) {
          setVideos(formatted);
        } else {
          setVideos((prev) => [
            ...prev,
            ...formatted.filter((v) => !prev.some((p) => p.id === v.id)),
          ]);
        }

        // Stop pagination when done
        if (!newVideos || newVideos.length < VIDEO_PAGE_SIZE) {
          setHasMoreData(false);
        }
      } catch (err) {
        console.error("Filter fetch error:", err);
        setHasMoreData(false);
      } finally {
        loader(false);
      }
    },
    []
  );

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    const init = async () => {
      const firstName = await AsyncStorage.getItem("firstName");
      const profilePic = await AsyncStorage.getItem("profileUrl");
      setUser({ firstName });
      setProfileImage(profilePic);

      if (passedVideos) {
        // 🔥 Instant load (from search results)
        setVideos(formatVideos(passedVideos));
        setIsLoading(false);
        setHasMoreData(false); // No pagination for passed videos
      } else if (filterCriteria) {
        // 🔥 Load via backend filters
        fetchFilteredVideos(0, filterCriteria);
      } else {
        // No videos & no filters
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /* -------------------- LOAD MORE (only when filterCriteria exists) -------------------- */
  const handleLoadMore = () => {
    if (!filterCriteria) return;
    if (!loadingMore && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFilteredVideos(nextPage, filterCriteria);
    }
  };

  /* -------------------- REFRESH -------------------- */
  const handleRefresh = async () => {
    if (!filterCriteria) return;
    setIsRefreshing(true);
    setPage(0);
    setHasMoreData(true);
    await fetchFilteredVideos(0, filterCriteria);
    setIsRefreshing(false);
  };

  /* -------------------- TAP ON VIDEO -------------------- */
  const handleVideoPress = useCallback(
    (item, index) => {
      navigation.navigate("FilterSwipe", {
        index,
        allvideos: videos,
      });
    },
    [videos]
  );

  const renderItem = ({ item, index }) => (
    <VideoThumbnail item={item} index={index} onPress={() => handleVideoPress(item, index)} />
  );

  return (
    <View style={styles.container}>
      <Header profile={profileImage} userName={user.firstName} />

      <ImageBackground source={require("./assets/login.jpg")} style={styles.imageBackground}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={renderItem}
            numColumns={4}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Videos Found</Text>
              </View>
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={isRefreshing}
            onRefresh={filterCriteria ? handleRefresh : null}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginVertical: 20 }} />
              ) : null
            }
          />
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 25,
  },
  imageBackground: { flex: 1, justifyContent: "center" },

  videoItemContainer: {
    flex: 1 / 4,
    aspectRatio: 9 / 16,
    padding: 1.5,
  },
  videoItem: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#222",
  },
  thumbnail: { flex: 1 },
  noThumbnailView: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  noThumbnailText: { color: "#888", fontSize: 10 },

  emptyContainer: { flex: 1, alignItems: "center", marginTop: 50 },
  emptyText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  confidenceBadge: {
    position: 'absolute',
    bottom: 4,
    left: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  confidenceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

});

export default FilteredVideosScreen;
