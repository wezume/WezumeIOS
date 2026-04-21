import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Image,
  Dimensions,
  ImageBackground,
  Button,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from './env';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [userData, setUserData] = useState(null);

  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      rotateY.value = interpolate(event.translationX, [-width / 2, width / 2], [-10, 10]);
      rotateX.value = interpolate(event.translationY, [-height / 2, height / 2], [10, -10]);
    })
    .onEnd(() => {
      rotateX.value = withTiming(0, { duration: 500 });
      rotateY.value = withTiming(0, { duration: 500 });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 300 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  });

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
          case 'Employee':
          case 'Entrepreneur':
          case 'Freelancer':
            console.log('🚀 Redirecting to Edit (Employee/Entrepreneur/Freelancer)');
            navigation.navigate('Edit');
            break;
          case 'Employer':
          case 'Investor':
            console.log('🏠 Redirecting to Edit (Employer/Investor)');
            navigation.navigate('Edit');
            break;
          default:
            console.error('⚠️ Navigation Failed: Unknown Role!', jobOption);
            Alert.alert('Login Error', `Unknown or unrecognized user role: ${jobOption}`);
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

      const { userId, firstName, email: userEmail, industry, videos, college, profileUrl, profilePic, jobid } = userDetails;
      const videoId = videos?.[0]?.videoId || null;

      if (jobOption === 'placementdrive' || jobOption === 'academy' || jobOption === 'placement') {
        await savePlacementLoginData(userId, firstName, userEmail, college, jobOption, profileUrl || profilePic, jobid);
        console.log('🔄 Existing LinkedIn user → Edit screen');
        navigation.navigate('Edit');
      } else {
        await saveStorage(userId, firstName, userEmail, jobOption, industry, videoId, college, profileUrl || profilePic);
        console.log('🏠 Existing LinkedIn user → Edit screen');
        navigation.navigate('Edit');
      }
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
    <ImageBackground
      style={styles.backgroundImage}
      source={require('./assets/Background-01.jpg')}
      resizeMode="cover">

      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.glassContainer, animatedStyle]}>
            <BlurView
              style={styles.absolute}
              blurType="xlight"
              blurAmount={8}
              reducedTransparencyFallbackColor="white"
            />
            <Image style={styles.img2} source={require('./assets/logopng.png')} />
            <Text style={styles.loginhead}>Login</Text>

            <TouchableOpacity style={styles.linkedinButton} onPress={handleLinkedInLogin}>
              <Text style={styles.linkedinButtonText}>LinkedIn</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.horizontalLine} />
              <Text style={styles.dividerText}>or Login with</Text>
              <View style={styles.horizontalLine} />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#333"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#333"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={() => navigation.navigate('ForgetPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password ?</Text>
            </TouchableOpacity>

            <LinearGradient colors={['#70bdff', '#2e80d8']} style={styles.loginButtonGradient}>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
              <Text style={styles.createAccount}>
                Don't Have An Account ? <Text style={{ color: '#0052cc' }}>SignUp</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('PlacemenntSignup')}>
              <Text style={styles.createAccount}>
                Signup as placement officer? <Text style={{ color: '#0052cc' }}>Click Here</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Conditional rendering of modals for performance */}
      {showLinkedInModal && (
        <Modal animationType="slide" transparent={true} visible={showLinkedInModal} onRequestClose={() => setShowLinkedInModal(false)}>
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
        <Modal animationType="fade" transparent={true} visible={showRoleSelection} onRequestClose={() => setShowRoleSelection(false)}>
          <View style={styles.roleModalOverlay}>
            <View style={styles.roleSelectionContainer}>
              <Text style={styles.roleTitle}>Select Your Role</Text>
              {['Employer', 'Freelancer', 'Employee', 'Entrepreneur', 'Investor'].map((role) => (
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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, justifyContent: 'center', width: '100%' },
  glassContainer: {
    width: '95%',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    marginTop: '40%',
    alignSelf: 'center'
  },

  img2: { width: 150, height: 75, alignSelf: 'center', marginBottom: 10 },
  loginhead: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 20, marginTop: '-10%' },
  input: { backgroundColor: 'rgba(255, 255, 255, 1)', borderWidth: 0.3, padding: 12, marginBottom: 12, borderRadius: 10, borderColor: '#0387e0', color: '#000', fontSize: 16, fontWeight: '500' },
  forgotPasswordText: { color: '#000', textAlign: 'right', fontSize: 14, paddingBottom: 15, fontWeight: '600' },
  loginButtonGradient: { borderRadius: 10, elevation: 5, marginBottom: 15 },
  loginButton: { paddingVertical: 12, justifyContent: 'center', alignItems: 'center' },
  loginButtonText: { fontWeight: 'bold', color: '#ffffff', fontSize: 18 },
  createAccount: { color: '#000', marginTop: 10, textAlign: 'center', fontWeight: '500', fontSize: 14 },
  linkedinButton: { backgroundColor: '#0077B5', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  linkedinButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  horizontalLine: { flex: 1, height: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  dividerText: { marginHorizontal: 10, fontSize: 14, fontWeight: '500', color: '#333' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, marginTop: 50 },
  roleModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  roleSelectionContainer: { width: '85%', padding: 20, backgroundColor: 'white', borderRadius: 15, alignItems: 'center' },
  roleTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  roleButton: { padding: 15, marginVertical: 8, width: '100%', backgroundColor: '#2e80d8', borderRadius: 10, alignItems: 'center' },
  roleText: { fontSize: 18, color: '#ffffff', fontWeight: '600' },
});

export default LoginScreen;