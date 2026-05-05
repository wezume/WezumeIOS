import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ImageBackground,
  Alert,
  BackHandler,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Header from './header'; // Assuming Header component exists
import Video from 'react-native-video';
import DeleteIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShareIcon from 'react-native-vector-icons/Ionicons';
import UploadIcon from 'react-native-vector-icons/Feather';
import PlayIcon from 'react-native-vector-icons/Ionicons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import AnalyticIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// NOTE: Replace './api' with your actual API client setup if necessary.
import apiClient from './api';

// --- Mock Environment Variables (Crucial for the share link) ---
const env = {
  // You MUST replace 'https://yourapi.com' with your app's actual base URL
  baseURL: 'https://app.wezume.in',
};

// --- API Service Functions ---
const apiService = {
  fetchVideo: (userId) => apiClient.get(`/api/videos/user/${userId}`),
  fetchSubtitles: (videoId) => apiClient.get(`/api/videos/user/${videoId}/subtitles.srt`),
  deleteVideo: (userId) => apiClient.delete(`/api/videos/delete/${userId}`),
  analyzeAudio: (videoId, audioUrl) => apiClient.get(`/api/audio/analyze`, { params: { videoId, filePath: audioUrl } }),
  checkProfanity: (videoUrl) => apiClient.post(`/api/videos/check-profane`, { file: videoUrl }),
  getFacialScore: (videoId, videoUrl) => apiClient.get(`/api/facial-score`, { params: { videoId, url: videoUrl } }),
};

// --- Sub-components (Kept outside to keep Home1 clean) ---

const VideoPlayer = ({ videoUri, subtitles }) => {
  const videoRef = useRef(null);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const currentSubtitle = useMemo(() => {
    return subtitles.find(sub => currentTime >= sub.startTime && currentTime <= sub.endTime)?.text || '';
  }, [currentTime, subtitles]);

  return (
    <TouchableOpacity style={styles.videoCard} activeOpacity={1} onPress={() => setIsPaused(!isPaused)}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.videoPlayer}
        resizeMode="contain"
        controls={false}
        onProgress={(e) => setCurrentTime(e.currentTime)}
        repeat={true}
        paused={isPaused}
        preferredForwardBufferDuration={2}
      />
      {isPaused && (
        <View style={styles.playPauseOverlay}>
          <PlayIcon name="play-circle" size={80} color="rgba(255, 255, 255, 0.7)" />
        </View>
      )}
      {currentSubtitle ? (
        <Text style={styles.subtitle}>{currentSubtitle}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const ActionButtons = ({ onShare, onDelete, onReview, isDisabled }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity style={styles.actionButton} onPress={onReview} disabled={isDisabled}>
      <AnalyticIcon name="brain" size={22} color="#fff" />
      <Text style={styles.actionButtonText}>AI Review</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onShare} disabled={isDisabled}>
      <ShareIcon name="share-social-outline" size={22} color="#fff" />
      <Text style={styles.actionButtonText}>Share</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onDelete}
      disabled={isDisabled}>
      <DeleteIcon name="delete-outline" size={22} color="#fff" />
    </TouchableOpacity>
  </View>
);

const NoVideoContent = ({ onUploadPress }) => (
  <View style={styles.noVideoContainer}>
    <View style={styles.noVideoCard}>
      <Text style={styles.noVideoTitle}>Upload Your Profile Video</Text>
      <Text style={styles.noVideoInstructions}>
        • Hold your phone in portrait mode.
        {'\n'}• Ensure your video is at least 30 seconds.
        {'\n'}• Review your transcription before uploading.
      </Text>
      <TouchableOpacity style={styles.uploadButton} onPress={onUploadPress}>
        <UploadIcon name="upload-cloud" size={22} color="#fff" />
        <Text style={styles.uploadButtonText}>Upload Video</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ===============================================
//          CORE COMPONENT: HOME1
// ===============================================

const Home1 = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // --- State and Data ---
  const [state, setState] = useState({
    loading: true,
    hasVideo: false,
    videoUri: null,
    audioUri: null,
    videoId: null,
    thumbnail: null,
    profileImage: null,
    userData: null,
    subtitles: [],
  });

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoLoading, setDemoLoading] = useState(true);
  const demoShownRef = useRef(false);

  const { loading, hasVideo, videoUri, audioUri, videoId, thumbnail, profileImage, userData, subtitles } = state;
  const userId = userData?.userId;
  const firstName = userData?.firstName;
  const analysisTriggered = useRef(false);

  /* 
     UseCallback for fetching video to prevent recreation.
     Modified to allow awaiting it in loadData.
  */
  const fetchVideoAndSubtitles = useCallback(async (currentUserId) => {
    try {
      const { data: videoData } = await apiService.fetchVideo(currentUserId);

      // Fetch subtitles in parallel if possible, or sequentially
      let parsedSubtitles = [];
      try {
        const { data: subtitlesData } = await apiService.fetchSubtitles(videoData.id);
        parsedSubtitles = parseSRT(subtitlesData);
      } catch (subError) {
        // ignore subtitle error
      }

      setState(s => ({
        ...s,
        videoUri: videoData.videoUrl,
        audioUri: videoData.audiourl,
        videoId: videoData.id,
        thumbnail: videoData.tumbnail,
        hasVideo: true,
        subtitles: parsedSubtitles,
        loading: false,
      }));

      await AsyncStorage.setItem('cachedVideoData', JSON.stringify(videoData));

    } catch (error) {
      if (error.response?.status === 404) {
        setState(s => ({ ...s, hasVideo: false, videoUri: null, videoId: null, subtitles: [], loading: false }));
        await AsyncStorage.removeItem('cachedVideoData');
      } else {
        console.error('Error fetching video:', error);
        setState(s => ({ ...s, loading: false }));
      }
    }
  }, []);

  const performDelete = useCallback(async () => {
    if (!userId) return;
    try {
      await apiService.deleteVideo(userId);
      await AsyncStorage.multiRemove(['videoId', 'cachedVideoData']);
      setState(s => ({ ...s, hasVideo: false, videoUri: null, videoId: null, subtitles: [] }));
      // Optional: reset navigation stack after deletion
      // navigation.reset({ index: 0, routes: [{ name: 'Home1' }] });
    } catch (error) {
      console.error('Error deleting video:', error);
      Alert.alert('Error', 'Could not delete the video.');
    }
  }, [userId, navigation]);

  const handleProfanityDetected = useCallback(() => {
    Alert.alert("Profanity Detected", "This video must be deleted.",
      [{ text: 'Delete Video', onPress: performDelete, style: 'destructive' }],
      { cancelable: false }
    );
  }, [performDelete]);

  const runAnalysis = useCallback(async () => {
    if (!videoId || !videoUri || !audioUri) return;
    try {
      await Promise.allSettled([
        apiService.checkProfanity(videoUri),
        apiService.getFacialScore(videoId, videoUri),
        apiService.analyzeAudio(videoId, audioUri),
      ]);
    } catch (error) {
      if (error.response?.status === 403) {
        handleProfanityDetected();
      } else {
        console.error('ANALYSIS Error:', error.message);
      }
    }
  }, [videoId, videoUri, audioUri, handleProfanityDetected]);

  // --- Action Handlers (Defined here to fix ReferenceError) ---

  const handleDeletePress = useCallback(() => {
    Alert.alert('Delete Video', 'Are you sure?',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: performDelete }]
    );
  }, [performDelete]);

  /**
   * Fixes the original ReferenceError by ensuring it's defined before JSX,
   * using useCallback, and having necessary dependencies.
   */
  const handleShare = useCallback(async () => {
    if (!firstName || !videoUri || !videoId) {
      Alert.alert('Error', 'Cannot share video at this time. Missing data.');
      return;
    }

    const shareLink = `${env.baseURL}/api/users/share?target=app://api/videos/user/${videoUri}/${videoId}`;

    try {
      // url must be the web link so recipients can tap it
      const shareOptions = {
        title: 'Share User Video',
        message: `Check out this video shared by ${firstName}`,
        url: shareLink,
      };

      await Share.open(shareOptions);
    } catch (error) {
      if (error.code !== 'ECANCELLED') {
        console.error('Error sharing video:', error);
        Alert.alert('Error', 'Error occurred during sharing.');
      }
    }
  }, [thumbnail, firstName, videoUri, videoId]);

  const handleReview = useCallback(() => {
    if (!videoId) {
      Alert.alert('Analysis Not Ready', 'Please wait until we finish processing your video.');
      return;
    }
    navigation.navigate('Test', { videoId });
  }, [videoId, navigation]);

  // --- Effects ---

  useEffect(() => {
    const loadData = async () => {
      setState(s => ({ ...s, loading: true }));
      const [
        firstName, userId, roleCode, college, profileUrl
      ] = await AsyncStorage.multiGet(['firstName', 'userId', 'roleCode', 'college', 'profileUrl']);

      const storedUserData = {
        firstName: firstName[1],
        userId: userId[1],
        roleCode: roleCode[1],
        college: college[1],
      };

      if (!storedUserData.userId) {
        setState(s => ({ ...s, loading: false }));
        return;
      }
      setState(s => ({
        ...s,
        userData: storedUserData,
        profileImage: profileUrl[1],
      }));

      fetchVideoAndSubtitles(storedUserData.userId);
    };

    if (isFocused) {
      loadData();
    }
  }, [isFocused, fetchVideoAndSubtitles]);

  useEffect(() => {
    if (!loading && !hasVideo && !demoShownRef.current) {
      setShowDemoModal(true);
      demoShownRef.current = true;
    }
  }, [loading, hasVideo]);

  useEffect(() => {
    if (videoId && videoUri && audioUri && isFocused && !analysisTriggered.current) {
      analysisTriggered.current = true;
      runAnalysis();
    }
    // Reset the trigger flag when the component loses focus
    return () => {
      if (!isFocused) {
        analysisTriggered.current = false;
      }
    }
  }, [videoId, videoUri, audioUri, isFocused, runAnalysis]);

  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFocused]);

  // --- Render ---

  if (loading) {
    return (
      <ImageBackground source={require('./assets/login.jpg')} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </ImageBackground>
    );
  }

  return (
    <View style={styles.safeArea}>
      <ImageBackground source={require('./assets/login.jpg')} style={styles.container}>
        <Header profile={profileImage} userName={userData?.firstName} />
        <View style={styles.content}>
          {hasVideo && videoUri ? (
            <>
              <VideoPlayer
                videoUri={videoUri}
                subtitles={subtitles}
              />
              <ActionButtons
                onShare={handleShare}
                onDelete={handleDeletePress}
                onReview={handleReview}
              />
            </>
          ) : (
            <NoVideoContent
              onUploadPress={() =>
                navigation.navigate('CameraPage', {
                  userId: userData?.userId,
                  roleCode: userData?.roleCode,
                  college: userData?.college,
                })
              }
            />
          )}

          <Modal
            visible={showDemoModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDemoModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.demoVideoContainer}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDemoModal(false)}
                >
                  <ShareIcon name="close-circle" size={35} color="#fff" />
                </TouchableOpacity>

                {demoLoading && (
                  <ActivityIndicator
                    size="large"
                    color="#fff"
                    style={styles.videoLoader}
                  />
                )}

                <Video
                  source={{ uri: 'https://wezume.in/wezumedemo.mp4' }}
                  style={styles.demoVideo}
                  resizeMode="contain"
                  controls={true}
                  paused={false}
                  ignoreSilentSwitch="ignore"
                  playInBackground={false}
                  playWhenInactive={false}
                  onLoad={() => setDemoLoading(false)}
                  onError={(e) => {
                    console.log('Video Error:', e);
                    setDemoLoading(false);
                  }}
                  repeat={true}
                  fullscreen={false}
                />
              </View>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 25,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  videoCard: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    position: 'absolute',
    bottom: 20,
    left: 15,
    right: 15,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    marginTop: 25,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  noVideoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3498db',
  },
  noVideoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  noVideoInstructions: {
    fontSize: 15,
    color: '#eee',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  uploadButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3498db',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoVideoContainer: {
    width: '90%',
    height: '70%',
    backgroundColor: '#000',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  demoVideo: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  videoLoader: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 5,
  },
});

export default Home1;