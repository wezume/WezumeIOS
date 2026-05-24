import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Text, ActivityIndicator, Modal, TextInput,
  Alert, Platform, StatusBar, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from './api';

const INK = '#0B1623';

const apiService = {
  fetchVideo: (userId) => apiClient.get(`/api/videos/user/${userId}`),
  updateTranscription: (userId, transcription) =>
    apiClient.put(`/api/videos/${userId}/transcription`,
      { transcription },
      { headers: { 'Content-Type': 'application/json' } }
    ),
};

const VideoPlayer = memo(({ uri }) => (
  <View style={styles.videoWrap}>
    <Video
      source={{ uri }}
      style={StyleSheet.absoluteFill}
      resizeMode="cover"
      controls
    />
  </View>
));

const TranscribeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [user, setUser] = useState({ userId: null });
  const [videoData, setVideoData] = useState({ uri: null, transcription: '', id: null, hasVideo: false });
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newTranscription, setNewTranscription] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error('User not found');
        setUser({ userId });

        if (route.params?.videos?.length > 0) {
          const v = route.params.videos[0];
          setVideoData({ uri: v.url, hasVideo: true, id: v.id, transcription: v.transcription || '' });
        } else {
          const res = await apiService.fetchVideo(userId);
          if (res.data?.videoUrl) {
            setVideoData({ uri: res.data.videoUrl, hasVideo: true, id: res.data.videoId, transcription: res.data.transcription || '' });
          }
        }
      } catch {
        Alert.alert('Error', 'Could not load video data.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [route.params]);

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

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#03152A', '#0B2138', '#1A3550']} style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.flex}>

        {/* Top chrome */}
        <View style={styles.topChrome}>
          <TouchableOpacity
            style={styles.glassBtn}
            onPress={() => navigation.navigate('HomeScreen')}
            activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.wezumeBadge}>
            <MaterialIcons name="mic" size={13} color="#fff" />
            <Text style={styles.wezumeBadgeText}>my take</Text>
          </View>
        </View>

        {/* Video */}
        {videoData.hasVideo && videoData.uri ? (
          <VideoPlayer uri={videoData.uri} />
        ) : (
          <View style={styles.noVideoWrap}>
            <MaterialIcons name="videocam-off" size={52} color="rgba(255,255,255,0.35)" />
            <Text style={styles.noVideoText}>No video available</Text>
          </View>
        )}

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleOpenTranscript} activeOpacity={0.8}>
            <MaterialIcons name="edit" size={18} color="#fff" />
            <Text style={styles.secondaryBtnText}>Edit Transcript</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('HomeScreen')} activeOpacity={0.88}>
            <LinearGradient
              colors={['#FFC93A', '#FF9F43']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}>
              <Text style={styles.primaryBtnText}>Go to Home →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* Transcript modal — bottom sheet */}
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
  flex: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B2138' },
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
  noVideoWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  noVideoText: { color: 'rgba(255,255,255,0.45)', fontSize: 16 },
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
  primaryBtn: { flex: 1 },
  primaryBtnGradient: {
    height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FFC93A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  primaryBtnText: { color: INK, fontSize: 15, fontWeight: '800' },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.65)' },
  modalCard: {
    backgroundColor: '#0F2438',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingTop: 12,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    padding: 14, color: '#fff', fontSize: 15, minHeight: 140, marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    height: 48, paddingHorizontal: 20, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  modalCancelText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  modalSave: { flex: 1 },
  modalSaveGradient: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  modalSaveText: { color: INK, fontSize: 15, fontWeight: '800' },
});

export default TranscribeScreen;
