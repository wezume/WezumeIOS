import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ActivityIndicator, Platform, StatusBar, SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import apiClient from './api';

const INK = '#0B1623';

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const LikeSummary = ({ notifications }) => {
  const count = notifications.length;
  const hasUnread = notifications.some(n => !n.isRead);
  const latest = notifications.reduce((a, b) =>
    new Date(b.timestamp) > new Date(a.timestamp) ? b : a
  );
  return (
    <View style={[styles.item, hasUnread && styles.itemUnread]}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="favorite" size={20} color="#e74c3c" />
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.itemText}>
          <Text style={styles.itemName}>{count}</Text>
          {count === 1 ? ' person liked your video' : ' people liked your video'}
        </Text>
        <Text style={styles.itemTime}>{timeAgo(latest.timestamp)}</Text>
      </View>
      {hasUnread && <View style={styles.unreadDot} />}
    </View>
  );
};

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      const res = await apiClient.get(`/api/notifications?userId=${userId}`);
      const items = res.data || [];
      setNotifications(items);

      // Mark all as read
      const unreadIds = items.filter(n => !n.isRead).map(n => n.id);
      if (unreadIds.length > 0) {
        await apiClient.post('/api/notifications/mark-as-read', unreadIds);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <LinearGradient colors={['#03152A', '#0B2138', '#1A3550']} style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.flex}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 38 }} />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#fff" />
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="notifications-off" size={56} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>When someone likes your video, you'll see it here.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            <LikeSummary notifications={notifications} />
          </View>
        )}

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  loader: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle:    { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  list: { padding: 16, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 14, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  itemUnread: {
    backgroundColor: 'rgba(30,155,215,0.10)',
    borderColor: 'rgba(30,155,215,0.25)',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(231,76,60,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  itemBody:    { flex: 1 },
  itemText:    { color: '#fff', fontSize: 14, lineHeight: 20 },
  itemName:    { fontWeight: '700' },
  itemTime:    { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 },
  unreadDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1E9BD7' },
});

export default NotificationsScreen;
