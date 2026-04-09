import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  ImageBackground,
  Modal,
  FlatList,
  Linking,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MenuComponent from './menu';

// --- Icon Mapping ---
const ICON_MAP = {
  Menu: 'menu',
  Notification: 'notifications',
  User: 'person',
  Search: 'search',
  Video: 'movie',
  FAQ: 'help-outline',
  Logout: 'logout',
  Privacy: 'security',
  Analytics: 'analytics',
  Tutorial: 'ondemand-video',
};

// --- Menu Item Generator (Remains the same) ---
const createMenuItem = (label, onPress, emojiKey, routeName) => ({
  label,
  onPress,
  icon: <MaterialIcons name={ICON_MAP[emojiKey]} size={24} color="#555" />,
  routeName,
});


const Header = ({ profile, userName }) => {
  const navigation = useNavigation();

  // 1. All hooks are now called unconditionally at the top level
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotiModalVisible, setIsNotiModalVisible] = useState(false);

  // 2. CONSOLIDATED USER DATA STATE
  const [userData, setUserData] = useState({
    jobOption: null,
    roleCode: null,
    email: null,
    isLoading: true
  });


  // --- Data Loading Effect ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const jobOption = await AsyncStorage.getItem('jobOption');
        const email = await AsyncStorage.getItem('email');
        const roleCode = await AsyncStorage.getItem('roleCode');

        // Update state with loaded data and set loading to false
        setUserData({ jobOption, email, roleCode, isLoading: false });
      } catch (error) {
        console.error('Error loading user data from AsyncStorage', error);
        setUserData(s => ({ ...s, isLoading: false })); // Still set loading to false on error
      }
    };
    loadData();
  }, []);

  // --- Notification Focus Effect (Remains the same and is correct) ---
  useFocusEffect(
    useCallback(() => {
      const fetchNotifications = async () => {
        try {
          const storedNotifications = await AsyncStorage.getItem('likeNotifications');
          setNotifications(storedNotifications ? JSON.parse(storedNotifications) : []);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    }, [])
  );

  // --- Performance Optimized Callbacks (Remain the same) ---
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out.');
    }
  }, [navigation]);

  const clearNotifications = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('likeNotifications');
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, []);

  const openLink = useCallback((url) => Linking.openURL(url).catch(err => console.error("Couldn't load page", err)), []);

  const navigateTo = useCallback((screenName) => navigation.navigate(screenName), [navigation]);

  // --- Memoized Menu Items Generator ---
  const getMenuItems = useCallback(() => {
    // Check for both loading status and existence of jobOption
    if (userData.isLoading || !userData.jobOption) {
      // While loading or if no role is set, only show Logout
      if (userData.isLoading) return [];

      // If not loading but no jobOption, only show logout
      return [createMenuItem('Logout', handleLogout, 'Logout')];
    }

    const userRole = userData.jobOption.toLowerCase();

    const items = [
      // createMenuItem('Tutorial', () => openLink('https://wezume.com/wezume-demo-video.mp4'), 'Tutorial'),
      createMenuItem('FAQ', () => openLink('https://wezume.in/faq.html'), 'FAQ'),
      createMenuItem('Privacy Policy', () => openLink('https://wezume.in/privacypolicy.html'), 'Privacy'),
    ];

    const isPlacementRole = ['placementdrive', 'academy'].includes(userRole);
    const isVideoRole = ['employee', 'entrepreneur', 'freelancer'].includes(userRole);

    if (!isPlacementRole) {
      items.unshift(
        createMenuItem('Profile', () => navigateTo('Account'), 'User', 'Account'),
        createMenuItem('Search', () => navigateTo('profile'), 'Search', 'profile')
      );

      if (isVideoRole) {
        items.splice(2, 0, createMenuItem('Videos', () => navigateTo('Myvideos'), 'Video', 'Myvideos'));
      }
    }

    if (userData.email === 'pitch@wezume.com') {
      items.push(
        createMenuItem('Analytics', () => navigateTo('AnalyticScreen'), 'Analytics', 'AnalyticScreen')
      );
    }

    items.push(createMenuItem('Logout', handleLogout, 'Logout'));

    return items;
  }, [userData, openLink, navigateTo, handleLogout]);


  const showNotificationButton = ['Employee', 'Entrepreneur', 'Freelancer'].includes(userData.jobOption);

  return (
    <>
      <ImageBackground
        source={require('./assets/login.jpg')}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <Image source={require('./assets/headlogo.png')} style={styles.logo} />

          <View style={styles.rightControls}>
            {/* The condition for rendering the button is simple and does not use a hook */}
            {showNotificationButton && (
              <TouchableOpacity onPress={() => setIsNotiModalVisible(true)} style={styles.controlButton}>
                <MaterialIcons name={ICON_MAP.Notification} size={25} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.controlButton}>
              <MaterialIcons name={ICON_MAP.Menu} size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <MenuComponent
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        menuItems={getMenuItems()}
        userName={userName}
        jobOption={userData.jobOption}
        profileImage={profile}
      />

      <Modal visible={isNotiModalVisible} animationType="slide" onRequestClose={() => setIsNotiModalVisible(false)}>
        <View style={styles.notiModalContainer}>
          <Text style={styles.notiTitle}>Notifications</Text>
          <FlatList
            data={notifications}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.notiItem}>
                <Text style={styles.notiText}>{item.firstName} ❤️ liked your video.</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.notiEmptyText}>No new notifications</Text>}
          />
          <View style={styles.notiFooter}>
            <TouchableOpacity style={[styles.notiButton, { backgroundColor: '#e74c3c' }]} onPress={clearNotifications}>
              <Text style={styles.notiButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.notiButton, { backgroundColor: '#3498db' }]} onPress={() => setIsNotiModalVisible(false)}>
              <Text style={styles.notiButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  logo: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
  },
  rightControls: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 8,
    marginLeft: 10,
  },
  notiModalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  notiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  notiItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  notiText: {
    fontSize: 16,
  },
  notiEmptyText: {
    textAlign: 'center',
    color: 'grey',
    marginTop: 50,
  },
  notiFooter: {
    marginTop: 'auto',
  },
  notiButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  notiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;