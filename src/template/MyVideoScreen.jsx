import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Platform, SafeAreaView, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const BASE_URL = 'https://app.wezume.in';

const WZ = {
  ink: '#0B1623', ink2: '#4A5A70', ink3: '#8B97A8',
  bg: '#F4F8FC', card: '#FFFFFF', line: '#E5ECF3',
};

const MyVideoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { videoId, userId, uri, thumbnail, firstName } = route.params || {};

  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleAIReview = useCallback(() => {
    navigation.navigate('Test', { videoId, userId });
  }, [navigation, videoId, userId]);

  const handleShare = useCallback(async () => {
    if (!thumbnail || !uri || !videoId) {
      Alert.alert('Error', 'Cannot share video at this time.');
      return;
    }
    try {
      const localPath = `${RNFS.CachesDirectoryPath}/share_thumb.jpg`;
      const result = await RNFS.downloadFile({ fromUrl: thumbnail, toFile: localPath }).promise;
      if (result.statusCode === 200) {
        await Share.open({
          title: 'My Video Resume',
          message: `Check out my video resume on wezume\n\n${BASE_URL}/api/users/share?target=app://api/videos/user/${uri}/${videoId}`,
          url: `file://${localPath}`,
        });
      }
    } catch (_) {}
  }, [thumbnail, uri, videoId]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete video',
      'This will permanently remove your video resume. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await apiClient.delete(`/api/videos/delete/${userId}`);
              await AsyncStorage.removeItem('cachedMyVideo');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err?.response?.data?.message || 'Could not delete video.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [userId, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Video */}
      <View style={styles.videoWrap}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={() => setIsPaused(p => !p)}
          activeOpacity={1}>
          {uri ? (
            <Video
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              paused={isPaused}
              repeat
              poster={thumbnail}
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
            />
          ) : (
            <Image source={{ uri: thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          )}
        </TouchableOpacity>

        {isLoading && (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        )}

        {/* Top chrome */}
        <View style={styles.topChrome}>
          <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name overlay */}
        {firstName ? (
          <View style={styles.nameChip}>
            <Text style={styles.nameChipText}>{firstName}</Text>
            <Text style={styles.nameChipSub}>Video Resume</Text>
          </View>
        ) : null}

        {isPaused && (
          <View style={styles.pauseOverlay} pointerEvents="none">
            <MaterialIcons name="play-circle-outline" size={72} color="rgba(255,255,255,0.8)" />
          </View>
        )}
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.aiReviewBtn} onPress={handleAIReview} activeOpacity={0.88}>
          <LinearGradient
            colors={['#FFC93A', '#FF9F43']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.aiReviewGradient}>
            <MaterialIcons name="auto-awesome" size={18} color={WZ.ink} />
            <Text style={styles.aiReviewText}>AI Review</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.8}>
          <MaterialIcons name="share" size={22} color={WZ.ink2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnDelete]}
          onPress={handleDelete}
          activeOpacity={0.8}
          disabled={deleting}>
          {deleting
            ? <ActivityIndicator size="small" color="#e74c3c" />
            : <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#000' },
  videoWrap: { flex: 1, backgroundColor: '#000' },
  loader:    { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  topChrome: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 0) + 12,
    left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  glassBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  nameChip: {
    position: 'absolute', bottom: 20, left: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12,
  },
  nameChipText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  nameChipSub:  { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 1 },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WZ.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    gap: 10,
    borderTopWidth: 1, borderTopColor: WZ.line,
  },
  aiReviewBtn:      { flex: 1 },
  aiReviewGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 48, borderRadius: 14,
    shadowColor: '#FFC93A', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  aiReviewText: { color: WZ.ink, fontSize: 15, fontWeight: '800' },
  iconBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: WZ.bg, borderWidth: 1, borderColor: WZ.line,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnDelete: { backgroundColor: '#fff5f5', borderColor: '#fde8e8' },
});

export default MyVideoScreen;
