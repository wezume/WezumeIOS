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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const WZ = {
  blue: '#1E9BD7', blueDeep: '#0E5A8E', blueLight: '#E6F5FB',
  navy: '#0B2138', navySoft: '#1A2F47',
  midnight: '#03152A', yellow: '#FFC93A', green: '#2CC6A1', coral: '#FF6B6B',
  amber: '#FFB020', ink: '#0B1623', ink2: '#4A5A70', ink3: '#8B97A8',
  line: '#E5ECF3', bg: '#F4F8FC', card: '#FFFFFF',
};

const CACHED_MY_VIDEO_KEY = 'cachedMyVideo';

// ── AI insight helpers (mirrors scoring.jsx hashtag logic) ──────────────────
const getTagForClarity = s => {
  if (s < 4) return '#Unclear';
  if (s <= 6) return '#Coherent';
  if (s <= 8) return '#Fluent';
  return '#Articulate';
};
const getTagForConfidence = s => {
  if (s < 4) return '#Hesitant';
  if (s <= 6) return '#Steady';
  if (s <= 8) return '#Poised';
  return '#Assured';
};
const getTagForAuthenticity = s => {
  if (s < 4) return '#Guarded';
  if (s <= 6) return '#Sincere';
  if (s <= 8) return '#Natural';
  return '#Genuine';
};
const getTagForEmotional = s => {
  if (s < 4) return '#Flat';
  if (s <= 6) return '#In-Tune';
  if (s <= 8) return '#Empathic';
  return '#Expressive';
};

const TAG_FNS = [
  { key: 'clarity',      fn: getTagForClarity },
  { key: 'confidence',   fn: getTagForConfidence },
  { key: 'authenticity', fn: getTagForAuthenticity },
  { key: 'emotional',    fn: getTagForEmotional },
];

// headlineTable + selectHeadline extracted from test.jsx
const headlineTable = [
  { primary: 'Clarity',      secondary: 'Confidence', weakness: 'EQ',
    options: ['Clear and Confident Communicator, Building People Signals', 'Structured and Assured Speaker with Growing EQ', 'Clear Thinker with Confident Delivery, Building EQ'] },
  { primary: 'Confidence',   secondary: 'Energy',     weakness: 'Clarity',
    options: ['Confident and Energetic Speaker with Strong Clarity', 'Assertive and Engaging, Building Structured Clarity', 'Engaging Speaker with High Confidence and Improving Structure'] },
  { primary: 'Authenticity', secondary: 'Clarity',    weakness: 'Confidence',
    options: ['Authentic and Clear Communicator, Building Confidence', 'Genuine Speaker with Strong Clarity, Improving Presence', 'Natural and Structured, Growing Confidence'] },
  { primary: 'Energy',       secondary: 'Confidence', weakness: 'Pause Ratio',
    options: ['High Energy and Confidence, Improve Pacing Control', 'Dynamic and Confident, Balance Your Pauses', 'Energetic Communicator, Improve Pause Balance'] },
];

const selectHeadline = (scores, weaknessName) => {
  const ranked = [
    { name: 'Clarity',      score: scores.clarity },
    { name: 'Confidence',   score: scores.confidence },
    { name: 'Authenticity', score: scores.authenticity },
    { name: 'EQ',           score: scores.eq },
  ].sort((a, b) => b.score - a.score);
  const primary = ranked[0].name;
  const secondary = ranked[1].name;
  const matched =
    headlineTable.find(r => r.primary === primary && r.secondary === secondary && r.weakness === weaknessName) ||
    headlineTable.find(r => r.primary === primary) ||
    headlineTable[0];
  return matched.options[0];
};

// --- Memoized and Animated Video Item ---
const formatVideoDate = (iso) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
};

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

  const dateLabel = formatVideoDate(item.createdAt);

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
      {dateLabel ? (
        <Text style={styles.videoDateLabel}>{dateLabel}</Text>
      ) : null}
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
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileTags, setProfileTags] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [resendSent, setResendSent] = useState(false);
  const [aiInsight, setAiInsight] = useState(null); // { headline, topTag, bottomTag }

  const refreshVerificationStatus = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/user-detail');
      const d = res.data ?? {};
      if (d.verification_status) {
        setVerificationStatus(d.verification_status);
        await AsyncStorage.setItem('verification_status', String(d.verification_status));
      }
      const fields = [
        d.firstName || d.name,
        d.education,
        d.experience,
        d.currentRole || d.currentDesignation,
        d.industry,
        d.profilepic || d.profileUrl,
      ];
      setProfileCompletion(Math.round((fields.filter(Boolean).length / fields.length) * 100));
      const tags = [
        d.industry && d.industry.split(',')[0].trim(),
        d.experience,
        d.education,
      ].filter(Boolean);
      setProfileTags(tags);
    } catch (_) {}
  }, []);

  const handleResendVerification = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('email');
      await apiClient.post('/api/verify/send', { email });
      setResendSent(true);
      Alert.alert('Email sent', 'Check your inbox for the verification link.');
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || '';
      console.warn('Verify send error:', status, msg);
      if (status === 409 || msg.toLowerCase().includes('already')) {
        setResendSent(true);
        Alert.alert('Email sent', 'A verification email was already sent. Check your inbox.');
      } else {
        refreshVerificationStatus();
        Alert.alert('Could not send', msg || 'Please try again in a moment.');
      }
    }
  }, [refreshVerificationStatus]);

  const fetchAIInsight = useCallback(async (videoId) => {
    try {
      const res = await apiClient.get(`api/totalscore/video/${videoId}`);
      const d = res.data ?? {};
      const scores = {
        clarity:      Number(d.clarityScore      || 0),
        confidence:   Number(d.confidenceScore   || 0),
        authenticity: Number(d.authenticityScore || 0),
        eq:           Number(d.eqScore || d.emotionalScore || 0),
      };
      // rank the 4 dimensions
      const ranked = TAG_FNS.map(t => ({ ...t, score: scores[t.key] || 0 }))
        .sort((a, b) => b.score - a.score);
      const topDim    = ranked[0];
      const bottomDim = ranked[ranked.length - 1];
      const headline  = selectHeadline(scores, bottomDim.key === 'eq' ? 'EQ' : bottomDim.key.charAt(0).toUpperCase() + bottomDim.key.slice(1));
      setAiInsight({
        headline,
        topTag:    topDim.fn(topDim.score),
        bottomTag: bottomDim.fn(bottomDim.score),
      });
    } catch (_) {
      // scores not computed yet — tile stays hidden
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
          thumbnail: video.thumbnail || video.tumbnail || null,
          link: video.links || '',
          createdAt: video.createdAt || null,
        }];
        setVideos(formatted);
        videosRef.current = formatted;
        await AsyncStorage.setItem(CACHED_MY_VIDEO_KEY, JSON.stringify(formatted));
        fetchAIInsight(video.id);
      } else {
        setVideos([]);
        videosRef.current = [];
      }
    } catch (err) {
      console.error('Error fetching my videos:', err);
    }
  }, [fetchAIInsight]);

  useEffect(() => {
    if (isFocused) refreshVerificationStatus();
  }, [isFocused, refreshVerificationStatus]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const firstName = await AsyncStorage.getItem('firstName');
      const userIdStr = await AsyncStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      const verStatus = await AsyncStorage.getItem('verification_status');

      if (!userId) {
        navigation.replace('LoginScreen');
        return;
      }
      const currentUser = { firstName, userId };
      setUser(currentUser);
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

  const handleVideoPress = useCallback((item) => {
    navigation.navigate('MyVideoScreen', {
      videoId: item.id,
      userId:  item.userId,
      uri:     item.uri,
      thumbnail: item.thumbnail,
      firstName: item.firstName,
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

  const isVerified = verificationStatus === 'verified';


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
          <TouchableOpacity style={styles.heroIconBtn} onPress={() => navigation.navigate('home1')} activeOpacity={0.7}>
            <MaterialIcons name="notifications-none" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Greeting */}
        <View style={styles.greetingWrap}>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>{user.firstName}</Text>
        </View>
      </LinearGradient>

      {/* Cards section (overlapping hero) */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Profile tile */}
        <View style={styles.profileTile}>
          <View style={styles.profileTileHeader}>
            <Text style={styles.profileTileTitle}>Your Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
              <LinearGradient
                colors={['#FFC93A', '#FF9F43']}
                style={styles.updateBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.updateBtnText}>update →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {profileCompletion > 0 && (
            <Text style={styles.profileTilePercent}>{profileCompletion}% complete</Text>
          )}
          {profileTags.length > 0 && (
            <View style={styles.tagRow}>
              {profileTags.map((tag, i) => (
                <View key={i} style={styles.profileTag}>
                  <Text style={styles.profileTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {isVerified ? (
            <View style={styles.verifiedPill}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MaterialIcons name="check-circle" size={13} color="#2CC6A1" />
                <Text style={styles.verifiedPillText}>email verified</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.verifyPill, resendSent && styles.verifyPillSent]}
              onPress={handleResendVerification}
              activeOpacity={0.8}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <MaterialIcons name="mail-outline" size={13} color="#fff" />
                <Text style={styles.verifyPillText}>
                  {resendSent ? 'email sent — resend' : 'verify your email'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* AI Insight tile */}
        {aiInsight ? (
          <LinearGradient
            colors={['#0B2138', '#1A3550']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.insightCard}>
            <Text style={styles.insightLabel}>AI REVIEW</Text>
            <Text style={styles.insightHeadline} numberOfLines={2}>{aiInsight.headline}</Text>
            <View style={styles.insightTagRow}>
              <View style={styles.insightTagGreen}>
                <Text style={styles.insightTagText}>{aiInsight.topTag}</Text>
              </View>
              <View style={styles.insightTagRed}>
                <Text style={styles.insightTagText}>{aiInsight.bottomTag}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                const v = videosRef.current[0];
                if (v) navigation.navigate('Test', { videoId: v.id, userId: v.userId });
              }}>
              <Text style={styles.insightCta}>See full review →</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <LinearGradient
            colors={['#0B2138', '#1A3550']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.insightCard}>
            <Text style={styles.insightLabel}>AI REVIEW</Text>
            <Text style={styles.insightHeadline}>Record a take to see your AI review.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CameraPage')}>
              <Text style={styles.insightCta}>Start now →</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

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
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  profileTag: {
    backgroundColor: WZ.blueLight,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  profileTagText: {
    color: WZ.blue,
    fontSize: 12,
    fontWeight: '600',
  },
  verifyPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B1A1A',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  verifyPillSent: {
    backgroundColor: '#5A3A00',
  },
  verifyPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(44,198,161,0.25)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  verifiedPillText: {
    color: '#2CC6A1',
    fontSize: 12,
    fontWeight: '600',
  },
  profileTile: {
    backgroundColor: WZ.card,
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  profileTileTitle: {
    color: WZ.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  profileTilePercent: {
    color: WZ.blue,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  updateBtn: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  updateBtnText: {
    color: WZ.ink,
    fontSize: 13,
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
  insightCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  insightLabel: {
    color: '#FFC93A',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  insightHeadline: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 24,
  },
  insightTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  insightTagGreen: {
    backgroundColor: 'rgba(34,197,94,0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  insightTagRed: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  insightTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  insightCta: {
    color: '#FFC93A',
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
  videoDateLabel: {
    color: WZ.ink3,
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 3,
    paddingHorizontal: 2,
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
