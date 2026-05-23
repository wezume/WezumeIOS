import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  Button,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from './env';

const { width: _width } = Dimensions.get('window'); // kept for potential future use

const WZ = {
  blue: '#1E9BD7', blueDeep: '#0E5A8E', navy: '#0B2138', navySoft: '#1A2F47',
  midnight: '#03152A', yellow: '#FFC93A', green: '#2CC6A1', coral: '#FF6B6B',
  amber: '#FFB020', ink: '#0B1623', ink2: '#4A5A70', ink3: '#8B97A8',
  line: '#E5ECF3', bg: '#F4F8FC', card: '#FFFFFF',
};

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [userData, setUserData] = useState(null);
  const [remember, setRemember] = useState(true);

  // Bob animation for mark image
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -8, duration: 1800, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [bobAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Both email and password are required!');
      return;
    }
    setLoading(true);

    try {
      const loginResponse = await axios.post(`${env.baseURL}/api/login`, { email, password });
      const { token, jobOption } = loginResponse.data;

      // 1. Log Initial API Response Data
      console.log('✅ Login Success. JobOption received from API:', jobOption);

      if (!token) throw new Error('Login failed, token not received.');
      await AsyncStorage.setItem('userToken', token);

      const userDetailsResponse = await axios.get(`${env.baseURL}/api/user-detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userDetails = userDetailsResponse.data;
      console.log("userDetails", userDetails);
      if (!userDetails || !userDetails.userId) throw new Error('User data is incomplete.');

      const {
        userId,
        firstName,
        email: userEmail,
        industry,
        videos,
        college,
        profileUrl,
        profilePic,
        jobid,
      } = userDetails;
      const videoId = videos?.[0]?.videoId || null;

      const role = jobOption

      console.log('➡️ Normalized JobOption for switch logic:', jobOption);


      if (role === 'placementdrive' || role === 'academy' || role === 'placement') {
        await savePlacementLoginData(userId, firstName, userEmail, college, jobOption, profileUrl || profilePic, jobid);
        console.log('🔄 Redirecting to RoleSelection (Placement/Academy user)');
        navigation.navigate('RoleSelection');
      } else {
        await saveStorage(userId, firstName, userEmail, jobOption, industry, videoId, college, profileUrl || profilePic);

        switch (jobOption) {
          case 'Employer':
          case 'Investor':
            navigation.navigate('RecruiterDash');
            break;
          default:
            navigation.navigate('HomeScreen');
            break;
        }
      }

      setEmail('');
      setPassword('');

    } catch (error) {
      // 3. Log detailed error information
      console.error('❌ Login failed during API call or data processing:', error.response ? error.response.data : error.message);
      Alert.alert('Login Failed', 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  const savePlacementLoginData = async (userId, firstName, email, college, jobOption, profileUrl, jobid) => {
    try {
      const dataToSave = [
        ['userId', userId ? userId.toString() : ''],
        ['firstName', firstName || ''],
        ['email', email || ''],
        ['college', college || ''],
        ['jobOption', jobOption || ''],
        ['profileUrl', profileUrl || ''],
        ['jobid', jobid ? jobid.toString() : ''],
      ];

      await AsyncStorage.multiSet(dataToSave);
      console.log('✅ Placement data (including jobid) saved successfully.');
    } catch (error) {
      console.error('❌ Error saving PlacementLogin data to AsyncStorage:', error);
    }
  };

  const saveStorage = async (userId, firstName, email, jobOption, industry, videoId, college, profileUrl) => {
    try {
      const items = [
        ['userId', userId ? userId.toString() : ''],
        ['firstName', firstName || ''],
        ['email', email || ''],
        ['jobOption', jobOption || ''],
        ['industry', industry || ''],
        ['college', college || ''],
        ['profileUrl', profileUrl || ''],
      ];

      if (videoId) {
        items.push(['videoId', videoId.toString()]);
      } else {
        await AsyncStorage.removeItem('videoId');
      }

      await AsyncStorage.multiSet(items);
      console.log('✅ User data saved successfully.');
    } catch (error) {
      console.error('Error saving data to AsyncStorage:', error);
    }
  };

  // --- LinkedIn Logic (Untouched) ---
  const handleLinkedInLogin = () => {
    setShowLinkedInModal(true);
  };

  const getQueryParams = (url) => {
    const params = {};
    const urlParts = url.split('?');
    if (urlParts.length > 1) {
      const queryString = urlParts[1];
      const pairs = queryString.split('&');
      pairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      });
    }
    return params;
  };

  const handleLinkedInExistingUserLogin = async (email, given_name, picture) => {
    // User exists — log them in using their email via the standard login endpoint
    try {
      console.log('🔄 Existing LinkedIn user, attempting login with email:', email);
      const loginResponse = await axios.post(`${env.baseURL}/api/login`, {
        email,
        password: 'LinkedInLogin_Secure',
      });
      const { token, jobOption } = loginResponse.data;

      if (!token) throw new Error('Login failed, token not received.');
      await AsyncStorage.setItem('userToken', token);

      const userDetailsResponse = await axios.get(`${env.baseURL}/api/user-detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userDetails = userDetailsResponse.data;
      if (!userDetails || !userDetails.userId) throw new Error('User data is incomplete.');

      const { userId, firstName, email: userEmail, industry, videos, college, profileUrl, profilePic } = userDetails;
      const videoId = videos?.[0]?.videoId || null;

      if (
        jobOption === 'Employer' ||
        jobOption === 'Investor' ||
        jobOption === 'placementdrive' ||
        jobOption === 'academy' ||
        jobOption === 'placement'
      ) {
        Alert.alert(
          'LinkedIn login unavailable',
          'LinkedIn sign-in is only available for Jobseekers, Freelancers and Entrepreneurs. Please use your email and password.',
        );
        return;
      }

      await saveStorage(userId, firstName, userEmail, jobOption, industry, videoId, college, profileUrl || profilePic);
      navigation.navigate('HomeScreen');
    } catch (loginError) {
      console.error('❌ LinkedIn existing user login failed:', loginError.response?.data || loginError.message);
      Alert.alert('Login Failed', 'Could not sign you in. Please try again.');
    }
  };

  const handleWebViewNavigationStateChange = async (navState) => {
    if (navState.url.includes('oauth/redirect')) {
      const params = getQueryParams(navState.url);
      const code = params.code;

      if (code) {
        setShowLinkedInModal(false);
        setLoading(true);
        try {
          const response = await axios.post(`${env.baseURL}/api/auth/linkedin`, { code });
          console.log('✅ LinkedIn Login Response Data:', response.data);
          const { given_name, email, picture } = response.data;

          if (given_name && email && picture) {
            try {
              // Check if this email is available (new user)
              const userCheck = await axios.post(`${env.baseURL}/api/users/check-email`, { email });

              // 200 OK → email is free → new user, show role selection
              console.log('🆕 New LinkedIn user detected. Showing role selection.');
              setUserData({ given_name, email, picture });
              setShowRoleSelection(true);
            } catch (checkError) {
              if (checkError.response && checkError.response.status === 400) {
                // 400 → email already registered → log them into their existing account
                console.log('✅ Email already registered. Logging into existing account...');
                await handleLinkedInExistingUserLogin(email, given_name, picture);
              } else {
                console.error('Check Email Error:', checkError.message);
                Alert.alert('Error', 'Could not verify your account. Please try again.');
              }
            }
          } else {
            Alert.alert('Error', 'User data is incomplete from LinkedIn.');
          }
        } catch (error) {
          console.error('Error during LinkedIn login:', error.response?.data || error.message);
          Alert.alert('Login Failed', 'Could not retrieve user data.');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleRoleSelect = async (role) => {
    if (!userData) return;
    const { email, given_name, picture } = userData;

    setLoading(true); // Show loader during registration
    try {
      // 1. Prepare registration data
      const formData = new FormData();
      formData.append('firstName', given_name);
      formData.append('lastName', ''); // LinkedIn usually only gives one name in given_name/family_name
      formData.append('email', email);
      formData.append('jobOption', role);
      formData.append('phoneNumber', `9${Date.now().toString().slice(-9)}`); // Unique placeholder
      formData.append('password', 'LinkedInLogin_Secure'); // Placeholder

      // 2. Perform the Signup
      console.log("🚀 Auto-Registering LinkedIn User:", email);
      await axios.post(
        `${env.baseURL}/api/users/signup/user`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      // 3. Success! Now log them in immediately to get the token and detailed user info
      console.log("✅ Registration successful. Performing auto-login for LinkedIn user...");
      await handleLinkedInExistingUserLogin(email, given_name, picture);

      // Cleanup
      setShowRoleSelection(false);
      setUserData(null);

    } catch (error) {
      console.error('LinkedIn Auto-Registration Failed:', error.response?.data || error.message);
      Alert.alert(
        'Registration Error',
        error.response?.data?.message || 'Could not create your account. Please try again or use standard signup.'
      );
    } finally {
      setLoading(false);
    }
  };
  // --------------------------------------------------------------------

  return (
    <LinearGradient
      colors={['#1E9BD7', '#0E5A8E', '#06243F']}
      style={{ flex: 1 }}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0.7, y: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled">

            {/* Topbar */}
            <View style={styles.topbar}>
              <TouchableOpacity
                onPress={() => navigation.navigate('LandingScreen')}
                style={styles.backBtn}>
                <Text style={styles.backArrow}>{'←'}</Text>
              </TouchableOpacity>
              <Text style={styles.wordmark}>wezume</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Splash mark with bob animation */}
            <View style={styles.markWrap}>
              <Animated.Image
                source={require('../assets/brand/wezume-mark.webp')}
                style={[styles.markImg, { transform: [{ translateY: bobAnim }] }]}
                resizeMode="contain"
              />
            </View>

            {/* Strapline */}
            <View style={styles.straplineRow}>
              <View style={styles.strapLine} />
              <Text style={styles.strapText}>SPEAK UP. STAND OUT.</Text>
              <View style={styles.strapLine} />
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              Welcome{' '}
              <Text style={{ color: WZ.yellow }}>back.</Text>
            </Text>

            {/* Glass form card */}
            <View style={styles.glassCard}>

              {/* Email input */}
              <TextInput
                style={styles.darkInput}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Password input */}
              <TextInput
                style={styles.darkInput}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* Remember me + Forgot row */}
              <View style={styles.rememberRow}>
                <TouchableOpacity
                  style={styles.rememberLeft}
                  onPress={() => setRemember(prev => !prev)}
                  activeOpacity={0.7}>
                  <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                    {remember && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>

              {/* Primary CTA */}
              <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
                <LinearGradient
                  colors={['#FFC93A', '#FF9F43']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}>
                  {loading ? (
                    <ActivityIndicator color={WZ.ink} size="small" />
                  ) : (
                    <Text style={styles.ctaText}>Sign in →</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* LinkedIn button */}
              <TouchableOpacity style={styles.linkedinBtn} onPress={handleLinkedInLogin} activeOpacity={0.8}>
                <Text style={styles.linkedinBtnText}>Continue with LinkedIn</Text>
              </TouchableOpacity>

            </View>

            {/* Footer */}
            <TouchableOpacity
              onPress={() => navigation.navigate('LandingScreen')}
              style={styles.footerWrap}>
              <Text style={styles.footerText}>
                New here?{' '}
                <Text style={styles.footerCta}>Make your wezume →</Text>
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {showLinkedInModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLinkedInModal}
          onRequestClose={() => setShowLinkedInModal(false)}>
          <View style={styles.modalContainer}>
            <WebView
              source={{ uri: 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=869zn5otx0ejyt&redirect_uri=https://www.linkedin.com/developers/tools/oauth/redirect&scope=profile%20email%20openid' }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              startInLoadingState={true}
            />
            <Button title="Close" onPress={() => setShowLinkedInModal(false)} />
          </View>
        </Modal>
      )}

      {showRoleSelection && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRoleSelection}
          onRequestClose={() => setShowRoleSelection(false)}>
          <View style={styles.roleModalOverlay}>
            <View style={styles.roleSelectionContainer}>
              <Text style={styles.roleTitle}>Select Your Role</Text>
              {['Employee', 'Freelancer', 'Entrepreneur'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={styles.roleButton}
                  onPress={() => handleRoleSelect(role)}>
                  <Text style={styles.roleText}>{role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  wordmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  markWrap: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  markImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  straplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 32,
  },
  strapLine: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  strapText: {
    color: WZ.yellow,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginHorizontal: 10,
  },
  headline: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  glassCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },
  darkInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    height: 52,
    borderRadius: 14,
    color: '#fff',
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: WZ.yellow,
    borderColor: WZ.yellow,
  },
  checkmark: {
    color: WZ.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  rememberText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 13,
  },
  forgotText: {
    color: WZ.yellow,
    fontSize: 13,
    fontWeight: '600',
  },
  ctaGradient: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  ctaText: {
    color: WZ.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  dividerLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  linkedinBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedinBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footerWrap: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 14,
  },
  footerCta: {
    color: WZ.yellow,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
  },
  roleModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  roleSelectionContainer: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  roleButton: {
    padding: 15,
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#2e80d8',
    borderRadius: 10,
    alignItems: 'center',
  },
  roleText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default LoginScreen;
