import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Linking,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SkillsIcon from 'react-native-vector-icons/Foundation';
import ExperienceIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IndustryIcon from 'react-native-vector-icons/FontAwesome';
import LocationIcon from 'react-native-vector-icons/Ionicons';
import LanguageIcon from 'react-native-vector-icons/FontAwesome';
import EmailIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import PhoneIcon from 'react-native-vector-icons/FontAwesome';
import RoleIcon from 'react-native-vector-icons/MaterialIcons';
// import RoleIcon from 'react-native-vector-icons/MaterialIcons';
import OrgIcon from 'react-native-vector-icons/FontAwesome5';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import ADIcon from 'react-native-vector-icons/AntDesign';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Buffer } from 'buffer';
import env from './env';
import Header from './header'; // Assuming Header component is in the same directory
import apiClient from './api';

// A reusable component for each detail card
const InfoCard = ({ title, children, icon }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      {icon}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    <View style={styles.cardContent}>
      {children}
    </View>
  </View>
);

const parseLinks = (rawLinks) => {
  if (!rawLinks) return [];
  let parsedLinks = [];

  if (Array.isArray(rawLinks)) {
    parsedLinks = rawLinks;
  } else if (typeof rawLinks === 'string') {
    try {
      const jsonLinks = JSON.parse(rawLinks);
      parsedLinks = Array.isArray(jsonLinks) ? jsonLinks : [];
    } catch (e) {
      if (rawLinks.trim().length > 0) {
        const items = rawLinks.split(',');
        parsedLinks = items.map(item => {
          const firstColon = item.indexOf(':');
          if (firstColon > -1) {
            return {
              type: item.substring(0, firstColon).trim(),
              url: item.substring(firstColon + 1).trim()
            };
          }
          return { type: 'Link', url: item.trim() };
        });
      }
    }
  }

  // Normalize
  return parsedLinks.map(link => {
    if (typeof link === 'string') return { type: 'Link', url: link };
    return link;
  });
};

const ProfileScreen = () => {
  const navigation = useNavigation();

  // Consolidated state for user data
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetches primary user details, sets the profile pic, and caches them
  const fetchUserDetails = async (userId) => {
    try {
      const response = await apiClient.get(`/api/videos/getOwnerByUserId/${userId}`);
      const freshUserData = response.data;
      console.log(freshUserData);
      if (freshUserData) {
        // Update user data state
        setUserData(freshUserData);

        // **Update profile image state from the API response**
        if (freshUserData.profileUrl) {
          setProfileImage(freshUserData.profileUrl);
          // Asynchronously update the cache with the fresh data
          await AsyncStorage.setItem('cachedProfileImage', freshUserData.profileUrl);
        }

        // Cache the latest user data
        await AsyncStorage.setItem('cachedUserData', JSON.stringify(freshUserData));
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      // Optionally, alert the user that fresh data couldn't be loaded
    }
  };

  // Fetches the like count
  const fetchLikeCount = async (videoId) => {
    try {
      const response = await apiClient.get(`/api/videos/${videoId}/like-count`);
      setLikeCount(response.data || 0);
    } catch (error) {
      console.error('Error fetching like count:', error);
      setLikeCount(0);
    }
  };

  // This effect runs when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        setLoading(true);

        // --- 1. LOAD FROM CACHE for an instant UI response ---
        try {
          const [cachedData, cachedImage] = await Promise.all([
            AsyncStorage.getItem('cachedUserData'),
            AsyncStorage.getItem('cachedProfileImage')
          ]);

          if (cachedData) {
            setUserData(JSON.parse(cachedData));
          }
          if (cachedImage) {
            setProfileImage(cachedImage);
          }
        } catch (e) {
          console.error("Failed to load data from cache", e);
        }

        // --- 2. FETCH FRESH DATA in the background to update UI and cache ---
        try {
          const userId = await AsyncStorage.getItem('userId');
          const videoId = await AsyncStorage.getItem('videoId');

          if (!userId) {
            console.log("User ID not found, navigating to login.");
            navigation.navigate('LoginScreen');
            return;
          }

          // Fetch all fresh data in parallel
          await Promise.all([
            fetchUserDetails(userId), // This function now handles the profile pic
            videoId ? fetchLikeCount(videoId) : Promise.resolve(),
          ]);

        } catch (error) {
          console.error('Failed to refresh profile data from server:', error);
        } finally {
          setLoading(false); // Stop loading after fresh data is fetched or fails
        }
      };

      loadProfileData();
    }, [navigation]) // navigation is a stable dependency
  );

  // Opens the account deletion link
  const openDeleteLink = () => {
    const url = 'https://wezume.com/delete/';
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  // Renders job-specific details to keep the main return statement clean
  const renderJobSpecificDetails = () => {
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
    if (!links || links.length === 0) return null;

    return (
      <InfoCard
        title="Links"
        icon={<MCIcon name="link-variant" size={24} color="#333" />}
      >
        <View style={styles.linksContainer}>
          {links.map((link, index) => {
            let iconComponent = <MCIcon name="link" size={24} color="#555" />;
            const typeLower = (link.type || '').toLowerCase();

            if (typeLower.includes('linkedin')) iconComponent = <ADIcon name="linkedin-square" size={24} color="#0077b5" />;
            else if (typeLower.includes('github')) iconComponent = <ADIcon name="github" size={24} color="#333" />;
            else if (typeLower.includes('leetcode')) iconComponent = <MCIcon name="code-braces" size={24} color="#f89f1b" />; // LeetCode color
            else if (typeLower.includes('blog')) iconComponent = <FA5Icon name="blog" size={20} color="#2c3e50" />;
            else if (typeLower.includes('portfolio')) iconComponent = <MCIcon name="web" size={24} color="#27ae60" />;

            return (
              <TouchableOpacity
                key={index}
                style={styles.linkItem}
                onPress={() => Linking.openURL(link.url).catch(err => console.error("Couldn't open link", err))}
              >
                {iconComponent}
                <Text style={styles.linkText} numberOfLines={1}>{link.type || 'Link'}</Text>
                <MCIcon name="open-in-new" size={16} color="#999" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            );
          })}
        </View>
      </InfoCard>
    );
  };

  if (loading && !userData) { // Only show full-screen loader on the very first load
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header profile={profileImage} userName={userData?.firstName} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('./assets/login.jpg')}
          style={styles.profileHeader}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.overlay}>
            <Image
              source={profileImage ? { uri: profileImage } : require('./assets/headlogo.png')} // Fallback image
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>{userData?.firstName} {userData?.lastName}</Text>
            <Text style={styles.jobTitle}>{userData?.industry}</Text>
            <View style={styles.likesContainer}>
              <FontAwesome name="thumbs-up" size={16} color="#fff" />
              <Text style={styles.likesText}>{likeCount} Likes</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Edit')}>
            <Text style={styles.profileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.profileButton, styles.deleteButton]} onPress={openDeleteLink}>
            <Text style={[styles.profileButtonText, styles.deleteButtonText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <InfoCard title="Contact Information" icon={<EmailIcon name="email-outline" size={24} color="#e74c3c" />}>
            <Text style={styles.cardText}>{userData?.email}</Text>
            <Text style={styles.cardSubText}>{userData?.phoneNumber}</Text>
          </InfoCard>
          <InfoCard title="Location" icon={<LocationIcon name="location-outline" size={24} color="#1abc9c" />}>
            <Text style={styles.cardText}>{userData?.city}</Text>
          </InfoCard>

          {renderJobSpecificDetails()}
          {renderLinks()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles remain unchanged ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  profileHeader: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackgroundImage: {
    opacity: 0.7,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  jobTitle: {
    fontSize: 14,
    color: '#eee',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 255, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  likesText: {
    fontSize: 13,
    marginLeft: 8,
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginTop: -30,
  },
  profileButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  profileButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#fff',
  },
  detailsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  cardContent: {
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  cardSubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  cardSubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  linksContainer: {
    marginTop: 5,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 16,
    color: '#3498db',
    marginLeft: 15,
    fontWeight: '500',
    flex: 1,
  },
});

export default ProfileScreen;