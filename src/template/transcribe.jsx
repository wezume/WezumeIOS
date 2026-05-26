import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Text, ActivityIndicator, Modal, TextInput,
  Alert, Platform, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from './api';

const INK = '#0B1623';
const POLL_INTERVAL = 5000;

const STAGES = [
  { key: 'uploaded',      label: 'Video uploaded',         icon: 'cloud-done' },
  { key: 'transcribing',  label: 'Analysing your speech…', icon: 'mic' },
  { key: 'scoring',       label: 'Calculating AI score…',  icon: 'auto-awesome' },
  { key: 'ready',         label: 'AI Score ready!',        icon: 'check-circle' },
];

function getStageIndex(status) {
  if (status === 'READY')    return 3;
  if (status === 'SCORING')  return 2;
  return 1; // PROCESSING or unknown → transcribing
}

const StageRow = ({ stage, state }) => {
  // state: 'done' | 'active' | 'pending'
  const color = state === 'done' ? '#4CD964'
              : state === 'active' ? '#FFC93A'
              : 'rgba(255,255,255,0.25)';
  return (
    <View style={stageStyles.row}>
      {state === 'active'
        ? <ActivityIndicator size="small" color={color} style={stageStyles.icon} />
        : <MaterialIcons name={stage.icon} size={20} color={color} style={stageStyles.icon} />}
      <Text style={[stageStyles.label, { color }]}>{stage.label}</Text>
    </View>
  );
};

const stageStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  icon:  { width: 24, marginRight: 10 },
  label: { fontSize: 15, fontWeight: '600' },
});

const apiService = {
  fetchVideo:           (userId)    => apiClient.get(`/api/videos/user/${userId}`),
  getStatus:            (videoId)   => apiClient.get(`/api/videos/processing-status/${videoId}`),
  updateTranscription:  (userId, t) =>
    apiClient.put(`/api/videos/${userId}/transcription`,
      { transcription: t },
      { headers: { 'Content-Type': 'application/json' } }
    ),
};

const VideoPlayer = memo(({ uri }) => (
  <View style={styles.videoWrap}>
    <Video source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" controls />
  </View>
));

const TranscribeScreen = () => {
  const navigation  = useNavigation();
  const route       = useRoute();
  const [user, setUser]           = useState({ userId: null });
  const [videoData, setVideoData] = useState({ uri: null, transcription: '', id: null, hasVideo: false });
  const [loading, setLoading]     = useState(true);
  const [processingStatus, setProcessingStatus] = useState('PROCESSING');
  const [videoReady, setVideoReady] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTranscription, setNewTranscription] = useState('');
  const pollRef = useRef(null);

  // ── load initial data ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error('User not found');
        setUser({ userId });

        if (route.params?.videos?.length > 0) {
          const v = route.params.videos[0];
          setVideoData({ uri: v.url, hasVideo: true, id: v.id, transcription: v.transcription || '' });
          const initial = v.processingStatus || (v.transcription ? 'SCORING' : 'PROCESSING');
          setProcessingStatus(initial);
          setVideoReady(!!v.filePath || initial === 'READY');
          if (initial !== 'READY') {
            await AsyncStorage.setItem('pendingVideoProcessing', JSON.stringify({ videoId: v.id, status: initial }));
          }
        } else {
          const res = await apiService.fetchVideo(userId);
          if (res.data?.videoUrl) {
            const vid = { uri: res.data.videoUrl, hasVideo: true, id: res.data.videoId, transcription: res.data.transcription || '' };
            setVideoData(vid);
            const status = res.data.processingStatus || (res.data.transcription ? 'SCORING' : 'PROCESSING');
            setProcessingStatus(status);
            setVideoReady(status === 'READY');
          }
        }
      } catch {
        Alert.alert('Error', 'Could not load video data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [route.params]);

  // ── polling ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!videoData.id || processingStatus === 'READY') return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await apiService.getStatus(videoData.id);
        const { status, videoReady: vr, videoUrl } = res.data;
        setProcessingStatus(status);
        if (vr) {
          setVideoReady(true);
          if (videoUrl) setVideoData(prev => ({ ...prev, uri: videoUrl }));
        }
        if (status === 'READY') {
          setVideoReady(true);
          clearInterval(pollRef.current);
          await AsyncStorage.removeItem('pendingVideoProcessing');
        }
      } catch (_) {}
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [videoData.id, processingStatus]);

  const handleOpenTranscript = useCallback(() => {
    setNewTranscription(videoData.transcription || '');
    setModalVisible(true);
  }, [videoData.transcription]);

  const handleSaveTranscription = useCallback(async () => {
    if (!user.userId) return;
    try {
      await apiService.updateTranscription(user.userId, newTranscription);
      setVideoData(prev => ({ ...prev, transcription: newTranscription }));
      setModalVisible(false);
      Alert.alert('Saved', 'Transcription updated.');
    } catch {
      Alert.alert('Error', 'Failed to update transcription.');
    }
  }, [user.userId, newTranscription]);

  const goHome = useCallback(() => navigation.navigate('HomeScreen'), [navigation]);

  const goAIReview = useCallback(() => {
    navigation.navigate('Test', { videoId: videoData.id, userId: user.userId });
  }, [navigation, videoData.id, user.userId]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const stageIndex = getStageIndex(processingStatus);
  const isReady    = processingStatus === 'READY';

  return (
    <LinearGradient colors={['#03152A', '#0B2138', '#1A3550']} style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.flex}>

        {/* Top chrome */}
        <View style={styles.topChrome}>
          <TouchableOpacity style={styles.glassBtn} onPress={goHome} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.wezumeBadge}>
            <MaterialIcons name="mic" size={13} color="#fff" />
            <Text style={styles.wezumeBadgeText}>my take</Text>
          </View>
        </View>

        {/* Video */}
        {videoData.hasVideo && videoData.uri && videoReady
          ? <VideoPlayer uri={videoData.uri} />
          : (
            <View style={styles.noVideoWrap}>
              <MaterialIcons name="videocam-off" size={52} color="rgba(255,255,255,0.35)" />
              <Text style={styles.noVideoText}>{videoData.hasVideo ? 'Video processing…' : 'No video available'}</Text>
            </View>
          )}

        {/* Processing card */}
        <View style={styles.processingCard}>
          <Text style={styles.processingTitle}>
            {isReady ? 'All done!' : 'Processing your video…'}
          </Text>
          {STAGES.map((stage, i) => {
            const state = i < stageIndex ? 'done' : i === stageIndex ? 'active' : 'pending';
            return <StageRow key={stage.key} stage={stage} state={state} />;
          })}
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {!isReady && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleOpenTranscript} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={18} color="#fff" />
              <Text style={styles.secondaryBtnText}>Edit Transcript</Text>
            </TouchableOpacity>
          )}
          {isReady && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={goAIReview} activeOpacity={0.8}>
              <MaterialIcons name="auto-awesome" size={18} color="#FFC93A" />
              <Text style={[styles.secondaryBtnText, { color: '#FFC93A' }]}>View AI Review</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={goHome} activeOpacity={0.88}>
            <LinearGradient
              colors={['#FFC93A', '#FF9F43']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}>
              <Text style={styles.primaryBtnText}>Continue Exploring →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* Transcript modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Edit Transcript</Text>
                <TextInput
                  value={newTranscription}
                  onChangeText={setNewTranscription}
                  style={styles.modalInput}
                  multiline
                  placeholder="Enter transcription…"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  textAlignVertical="top"
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSave} onPress={handleSaveTranscription} activeOpacity={0.88}>
                    <LinearGradient
                      colors={['#FFC93A', '#FF9F43']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.modalSaveGradient}>
                      <Text style={styles.modalSaveText}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex:         { flex: 1 },
  loadingWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2138' },
  topChrome: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 12,
  },
  glassBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  wezumeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(30,155,215,0.85)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  wezumeBadgeText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  videoWrap: {
    flex: 1, marginHorizontal: 16, borderRadius: 18,
    overflow: 'hidden', backgroundColor: '#000',
  },
  noVideoWrap:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noVideoText:  { color: 'rgba(255,255,255,0.45)', fontSize: 16 },
  processingCard: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  processingTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 },
  bottomBar: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 16, paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, paddingHorizontal: 16, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  secondaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  primaryBtn:         { flex: 1 },
  primaryBtnGradient: {
    height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FFC93A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  primaryBtnText: { color: INK, fontSize: 15, fontWeight: '800' },
  // Modal
  modalOverlay:  { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  modalCard: {
    backgroundColor: '#0F2438',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingTop: 12,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  modalHandle:    { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginBottom: 16 },
  modalTitle:     { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    padding: 14, color: '#fff', fontSize: 15, minHeight: 140, marginBottom: 16,
  },
  modalActions:     { flexDirection: 'row', gap: 10 },
  modalCancel: {
    height: 48, paddingHorizontal: 20, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  modalCancelText:    { color: '#fff', fontSize: 15, fontWeight: '600' },
  modalSave:          { flex: 1 },
  modalSaveGradient:  { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalSaveText:      { color: INK, fontSize: 15, fontWeight: '800' },
});

export default TranscribeScreen;
