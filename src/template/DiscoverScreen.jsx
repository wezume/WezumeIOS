import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ImageBackground, ActivityIndicator,
  Platform, StatusBar, SafeAreaView, ScrollView, Image,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const WZ = {
  blue: '#1E9BD7', blueLight: '#E6F5FB',
  navy: '#0B2138', navySoft: '#1A2F47',
  ink: '#0B1623', ink2: '#4A5A70', ink3: '#8B97A8',
  line: '#E5ECF3', bg: '#F4F8FC', card: '#FFFFFF',
};

const CATEGORIES = ['For you', 'New', 'Likes'];

const CATEGORY_FILTERS = {
  'For you': {},
  'New':     { sortBy: 'newest' },
  'Likes':   { sortBy: 'mostLiked' },
};

const PAGE_SIZE = 21;

const VideoCard = memo(({ item, index, onPress, showScore }) => {
  const scale   = useSharedValue(0.88);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value   = withDelay(index * 25, withTiming(1,   { duration: 180 }));
    opacity.value = withDelay(index * 25, withTiming(1,   { duration: 180 }));
  }, [index, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isRecent = item.createdAt
    ? Date.now() - new Date(item.createdAt).getTime() < 3600000
    : false;

  return (
    <Animated.View style={[styles.cardWrap, animStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.card}>
        {item.thumbnail ? (
          <ImageBackground source={{ uri: item.thumbnail }} style={styles.thumb} resizeMode="cover">
            {isRecent && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            )}
            {showScore && item.confidence != null && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreBadgeText}>★ {item.confidence}%</Text>
              </View>
            )}
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>wezume</Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={[styles.thumb, styles.noThumb]}>
            <MaterialIcons name="play-circle-outline" size={28} color="#4A5A70" />
          </View>
        )}
        <Text style={styles.cardName} numberOfLines={1}>{item.firstName || '—'}</Text>
        {item.duration ? <Text style={styles.cardDuration}>{item.duration}</Text> : null}
      </TouchableOpacity>
    </Animated.View>
  );
});

const DiscoverScreen = () => {
  const navigation = useNavigation();

  const [searchText, setSearchText]       = useState('');
  const [activeCategory, setActiveCategory] = useState('For you');
  const [videos, setVideos]               = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [isSearching, setIsSearching]     = useState(false);
  const [isSearchMode, setIsSearchMode]   = useState(false);
  const [hasMore, setHasMore]             = useState(true);
  const [page, setPage]                   = useState(0);
  const [isHireUser, setIsHireUser]       = useState(false);

  const userIdRef = useRef(null);

  const formatVideos = (list) =>
    (Array.isArray(list) ? list : [])
      .filter(v => v.thumbnail)
      .map(v => ({
        id:          v.id,
        userId:      v.userId,
        uri:         v.videoUrl || v.uri,
        firstName:   v.firstname || v.firstName || '',
        thumbnail:   v.thumbnail,
        confidence:  v.confidence ?? null,
        createdAt:   v.createdAt || null,
        duration:    v.duration  || null,
        link:        v.links     || null,
        email:       v.email     || '',
        phoneNumber: v.phoneNumber || v.phonenumber || '',
      }));

  const fetchVideos = useCallback(async (currentPage, category, reset = false) => {
    if (currentPage === 0) setIsLoading(true);
    else setLoadingMore(true);
    try {
      const filters = {
        ...(CATEGORY_FILTERS[category] || {}),
        page: currentPage,
        size: PAGE_SIZE,
      };
      const res = await apiClient.post('/api/videos/filter', filters);
      const raw = Array.isArray(res.data?.videos) ? res.data.videos
        : Array.isArray(res.data) ? res.data : [];
      const formatted = formatVideos(raw);
      setVideos(prev =>
        currentPage === 0 || reset
          ? formatted
          : [...prev, ...formatted.filter(v => !prev.some(p => p.id === v.id))],
      );
      setHasMore(raw.length >= PAGE_SIZE);
    } catch (err) {
      console.error('Discover fetch error:', err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const runSearch = useCallback(async (text) => {
    if (!text.trim()) {
      setIsSearchMode(false);
      setPage(0);
      setHasMore(true);
      fetchVideos(0, activeCategory, true);
      return;
    }
    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const userId = userIdRef.current || await AsyncStorage.getItem('userId');
      userIdRef.current = userId;
      const res = await apiClient.post(
        '/api/search/voice',
        null,
        { params: { userId: Number(userId), transcription: text.trim() } },
      );
      const raw = Array.isArray(res.data) ? res.data : (res.data?.videos || []);
      setVideos(formatVideos(raw));
      setHasMore(false);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [activeCategory, fetchVideos]);

  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
    setSearchText('');
    setIsSearchMode(false);
    setPage(0);
    setHasMore(true);
    fetchVideos(0, cat, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !searchText) {
      const next = page + 1;
      setPage(next);
      fetchVideos(next, activeCategory);
    }
  };

  const handleVideoPress = useCallback((_item, index) => {
    navigation.navigate('FilterSwipe', { index, allvideos: videos });
  }, [navigation, videos]);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(id => { userIdRef.current = id; });
    AsyncStorage.getItem('jobOption').then(opt => {
      setIsHireUser(opt === 'Employer' || opt === 'Investor');
    });
    fetchVideos(0, 'For you', true);
  }, [fetchVideos]);

  const renderItem = useCallback(({ item: vid, index }) => (
    <VideoCard item={vid} index={index} onPress={() => handleVideoPress(vid, index)} showScore={isHireUser && isSearchMode} />
  ), [handleVideoPress, isHireUser, isSearchMode]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={WZ.bg} />

      {/* Header */}
      <LinearGradient
        colors={['#1E9BD7', '#0E5A8E']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.header}>
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSub}>Browse video resumes</Text>
          </View>
          <Image
            source={require('../assets/brand/wezume-wordmark-trimmed.png')}
            style={styles.wordmark}
            resizeMode="contain"
            tintColor="rgba(255,255,255,0.65)"
          />
        </View>
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={WZ.ink3} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by skill, role, or name"
            placeholderTextColor={WZ.ink3}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => runSearch(searchText)}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setIsSearchMode(false); runSearch(''); }}>
              <MaterialIcons name="close" size={18} color={WZ.ink3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => handleCategorySelect(cat)}
            activeOpacity={0.8}>
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      {(isLoading || isSearching) ? (
        <ActivityIndicator size="large" color={WZ.blue} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={3}
          contentContainerStyle={styles.grid}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator size="small" color={WZ.blue} style={{ marginVertical: 16 }} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="video-library" size={48} color={WZ.ink3} />
              <Text style={styles.emptyText}>No videos found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WZ.bg },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : 14,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 0.2 },
  headerSub:   { color: 'rgba(255,255,255,0.60)', fontSize: 11, marginTop: 1 },
  wordmark:    { height: 22, width: 86, opacity: 0.7 },
  searchRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: WZ.card, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, color: WZ.ink, fontSize: 14 },
  chipRow:     { maxHeight: 46, marginBottom: 12, flexShrink: 0 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: WZ.card, borderWidth: 1, borderColor: WZ.line,
  },
  chipActive:     { backgroundColor: WZ.blue, borderColor: WZ.blue },
  chipText:       { color: WZ.ink2, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  grid:           { paddingHorizontal: 12, paddingBottom: 20 },
  cardWrap:       { flex: 1 / 3, padding: 3 },
  card:           { borderRadius: 10, overflow: 'hidden', backgroundColor: WZ.card },
  thumb: {
    aspectRatio: 9 / 13, borderRadius: 10,
    overflow: 'hidden', backgroundColor: '#1A2F47',
  },
  noThumb:       { justifyContent: 'center', alignItems: 'center' },
  liveBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: '#FF3B30', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  liveBadgeText:  { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  scoreBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  scoreBadgeText: { color: '#FFD700', fontSize: 9, fontWeight: '700' },
  brandBadge: {
    position: 'absolute', bottom: 5, left: 5,
    backgroundColor: 'rgba(14,90,142,0.75)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  brandBadgeText: { color: '#fff', fontSize: 8, fontWeight: '600' },
  cardName:       { color: WZ.ink, fontSize: 11, fontWeight: '600', marginTop: 4, paddingHorizontal: 2 },
  cardDuration:   { color: WZ.ink3, fontSize: 10, paddingHorizontal: 2, marginBottom: 4 },
  emptyWrap:      { marginTop: 60, alignItems: 'center' },
  emptyText:      { color: WZ.ink2, marginTop: 12, fontSize: 15 },
});

export default DiscoverScreen;
