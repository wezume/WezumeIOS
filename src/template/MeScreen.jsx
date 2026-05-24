import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ImageBackground, ScrollView, Linking, ActivityIndicator,
  SafeAreaView, Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SkillsIcon from 'react-native-vector-icons/Foundation';
import ExperienceIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IndustryIcon from 'react-native-vector-icons/FontAwesome';
import LocationIcon from 'react-native-vector-icons/Ionicons';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import ADIcon from 'react-native-vector-icons/AntDesign';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import OrgIcon from 'react-native-vector-icons/FontAwesome5';
import RoleIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const InfoCard = ({ title, children, icon }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      {icon}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View>{children}</View>
  </View>
);

const parseLinks = (rawLinks) => {
  if (!rawLinks) return [];
  if (Array.isArray(rawLinks)) return rawLinks;
  try {
    const parsed = JSON.parse(rawLinks);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return rawLinks.trim()
      ? rawLinks.split(',').map(item => {
          const i = item.indexOf(':');
          return i > -1
            ? { type: item.substring(0, i).trim(), url: item.substring(i + 1).trim() }
            : { type: 'Link', url: item.trim() };
        })
      : [];
  }
};

const MeScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async (userId) => {
    try {
      const res = await apiClient.get(`/api/videos/getOwnerByUserId/${userId}`);
      const d = res.data;
      if (d) {
        setUserData(d);
        if (d.profileUrl) {
          setProfileImage(d.profileUrl);
          await AsyncStorage.setItem('cachedProfileImage', d.profileUrl);
        }
        await AsyncStorage.setItem('cachedUserData', JSON.stringify(d));
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const fetchLikeCount = async (videoId) => {
    try {
      const res = await apiClient.get(`/api/videos/${videoId}/like-count`);
      setLikeCount(res.data || 0);
    } catch {
      setLikeCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          const [cachedData, cachedImage] = await Promise.all([
            AsyncStorage.getItem('cachedUserData'),
            AsyncStorage.getItem('cachedProfileImage'),
          ]);
          if (cachedData) setUserData(JSON.parse(cachedData));
          if (cachedImage) setProfileImage(cachedImage);
        } catch {}

        try {
          const userId = await AsyncStorage.getItem('userId');
          const videoId = await AsyncStorage.getItem('videoId');
          if (!userId) { navigation.navigate('LoginScreen'); return; }
          await Promise.all([
            fetchUserDetails(userId),
            videoId ? fetchLikeCount(videoId) : Promise.resolve(),
          ]);
        } catch (err) {
          console.error('Me screen refresh error:', err);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [navigation]),
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        },
      },
    ]);
  };

  const openLink = (url) => Linking.openURL(url).catch(() => {});

  const renderJobDetails = () => {
    if (!userData) return null;
    switch (userData.jobOption) {
      case 'Employee':
        return (
          <>
            <InfoCard title="Skills" icon={<SkillsIcon name="social-skillshare" size={24} color="#3498db" />}>
              <Text style={styles.cardText}>{userData.keySkills}</Text>
            </InfoCard>
            <InfoCard title="Experience" icon={<ExperienceIcon name="briefcase-outline" size={24} color="#2ecc71" />}>
              <Text style={styles.cardText}>{userData.experience} years</Text>
              <Text style={styles.cardSubText}>at {userData.currentEmployer}</Text>
            </InfoCard>
            <InfoCard title="Industry" icon={<IndustryIcon name="industry" size={20} color="#e67e22" />}>
              <Text style={styles.cardText}>{userData.industry}</Text>
            </InfoCard>
          </>
        );
      case 'Investor':
      case 'Employer':
        return (
          <>
            <InfoCard title="Organization" icon={<OrgIcon name="building" size={20} color="#3498db" />}>
              <Text style={styles.cardText}>{userData.currentEmployer}</Text>
            </InfoCard>
            <InfoCard title="Industry" icon={<IndustryIcon name="industry" size={20} color="#e67e22" />}>
              <Text style={styles.cardText}>{userData.industry}</Text>
            </InfoCard>
          </>
        );
      case 'Entrepreneur':
        return (
          <>
            <InfoCard title="Key Skills" icon={<SkillsIcon name="social-skillshare" size={24} color="#3498db" />}>
              <Text style={styles.cardText}>{userData.keySkills}</Text>
            </InfoCard>
            <InfoCard title="Current Role" icon={<RoleIcon name="person" size={24} color="#9b59b6" />}>
              <Text style={styles.cardText}>{userData.currentRole}</Text>
            </InfoCard>
            <InfoCard title="Industry" icon={<IndustryIcon name="industry" size={20} color="#e67e22" />}>
              <Text style={styles.cardText}>{userData.industry}</Text>
            </InfoCard>
          </>
        );
      default:
        return null;
    }
  };

  const renderLinks = () => {
    const links = parseLinks(userData?.links || userData?.socialLinks);
    if (!links.length) return null;
    return (
      <InfoCard title="Links" icon={<MCIcon name="link-variant" size={24} color="#333" />}>
        <View>
          {links.map((link, i) => {
            const t = (link.type || '').toLowerCase();
            let icon = <MCIcon name="link" size={22} color="#555" />;
            if (t.includes('linkedin')) icon = <ADIcon name="linkedin-square" size={22} color="#0077b5" />;
            else if (t.includes('github')) icon = <ADIcon name="github" size={22} color="#333" />;
            else if (t.includes('leetcode')) icon = <MCIcon name="code-braces" size={22} color="#f89f1b" />;
            else if (t.includes('blog')) icon = <FA5Icon name="blog" size={18} color="#2c3e50" />;
            else if (t.includes('portfolio')) icon = <MCIcon name="web" size={22} color="#27ae60" />;
            return (
              <TouchableOpacity key={i} style={styles.linkItem}
                onPress={() => Linking.openURL(link.url).catch(() => {})}>
                {icon}
                <Text style={styles.linkText} numberOfLines={1}>{link.type || 'Link'}</Text>
                <MCIcon name="open-in-new" size={15} color="#999" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            );
          })}
        </View>
      </InfoCard>
    );
  };

  if (loading && !userData) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <ImageBackground
          source={require('./assets/login.jpg')}
          style={styles.hero}
          imageStyle={{ opacity: 0.7 }}>
          <View style={styles.heroOverlay}>
            <Image
              source={profileImage ? { uri: profileImage } : require('./assets/headlogo.png')}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userData?.firstName} {userData?.lastName}</Text>
            <Text style={styles.industry}>{userData?.industry}</Text>
            <View style={styles.likesRow}>
              <FontAwesome name="thumbs-up" size={14} color="#fff" />
              <Text style={styles.likesText}>{likeCount} Likes</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Edit button */}
        <View style={styles.editRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}>
            <MaterialIcons name="edit" size={16} color="#1E9BD7" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile details */}
        <View style={styles.details}>
          <InfoCard title="Contact" icon={<MCIcon name="email-outline" size={22} color="#e74c3c" />}>
            <Text style={styles.cardText}>{userData?.email}</Text>
            <Text style={styles.cardSubText}>{userData?.phoneNumber}</Text>
          </InfoCard>
          <InfoCard title="Location" icon={<LocationIcon name="location-outline" size={22} color="#1abc9c" />}>
            <Text style={styles.cardText}>{userData?.city}</Text>
          </InfoCard>
          {renderJobDetails()}
          {renderLinks()}
        </View>

        {/* Settings section */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsLabel}>MORE</Text>

          <TouchableOpacity style={styles.settingsRow}
            onPress={() => openLink('https://wezume.in/faq.html')}>
            <MaterialIcons name="help-outline" size={22} color="#555" />
            <Text style={styles.settingsText}>FAQ</Text>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow}
            onPress={() => openLink('https://wezume.in/privacypolicy.html')}>
            <MaterialIcons name="security" size={22} color="#555" />
            <Text style={styles.settingsText}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsRow}
            onPress={() => openLink('https://wezume.com/delete/')}>
            <MaterialIcons name="delete-outline" size={22} color="#e74c3c" />
            <Text style={[styles.settingsText, { color: '#e74c3c' }]}>Delete Account</Text>
            <MaterialIcons name="chevron-right" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f9' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  hero: { height: 200, justifyContent: 'center', alignItems: 'center' },
  heroOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%', justifyContent: 'center', alignItems: 'center', padding: 15,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: '#fff', marginBottom: 8,
  },
  name: {
    fontSize: 20, fontWeight: 'bold', color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10,
  },
  industry: { fontSize: 13, color: '#eee', marginTop: 2 },
  likesRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,123,255,0.8)',
    paddingVertical: 3, paddingHorizontal: 10, borderRadius: 20, marginTop: 6,
  },
  likesText: { fontSize: 12, marginLeft: 6, color: '#fff', fontWeight: '600' },
  editRow: {
    paddingHorizontal: 16, paddingVertical: 12,
    alignItems: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  editBtnText: { color: '#1E9BD7', fontSize: 14, fontWeight: '700' },
  details: { paddingHorizontal: 15, paddingBottom: 8 },
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 18, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginLeft: 10 },
  cardText: { fontSize: 15, color: '#555', lineHeight: 22 },
  cardSubText: { fontSize: 13, color: '#777', marginTop: 4 },
  linkItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  linkText: { fontSize: 14, color: '#3498db', marginLeft: 12, fontWeight: '500', flex: 1 },
  settingsSection: {
    marginHorizontal: 15, backgroundColor: '#fff', borderRadius: 10,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  settingsLabel: {
    fontSize: 11, fontWeight: '700', color: '#999',
    letterSpacing: 1.2, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    gap: 14,
  },
  settingsText: { fontSize: 15, color: '#333', fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginHorizontal: 15, marginBottom: 8,
    backgroundColor: '#e74c3c', borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#e74c3c', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default MeScreen;
