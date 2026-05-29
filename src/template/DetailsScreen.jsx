import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { WZ } from '../theme';
import StepDots from '../components/StepDots';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useOnboarding } from './OnboardingContext';
import env from './env';

// ─── LightInput ─────────────────────────────────────────────────────────────
const LightInput = memo(({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  iconLabel,
  showPasswordToggle,
}) => {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View style={inputStyles.row}>
      <View style={inputStyles.iconWrap}>
        <Text style={inputStyles.icon}>{iconLabel}</Text>
      </View>
      <TextInput
        style={inputStyles.field}
        placeholder={placeholder}
        placeholderTextColor={WZ.ink3}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hidden}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={autoCorrect ?? true}
        returnKeyType="next"
        underlineColorAndroid="transparent"
      />
      {showPasswordToggle && (
        <TouchableOpacity
          onPress={() => setHidden(h => !h)}
          style={inputStyles.eyeBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={inputStyles.eyeIcon}>{hidden ? '👁️' : '🙈'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const inputStyles = StyleSheet.create({
  row: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5ECF3',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
  field: {
    flex: 1,
    fontSize: 15,
    color: WZ.ink,
    paddingRight: 12,
  },
  eyeBtn: {
    paddingRight: 14,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 16,
  },
});

// ─── Role map / chip config ──────────────────────────────────────────────────
const ROLE_MAP = {
  jobseeker:    'Employee',
  freelancer:   'Freelancer',
  entrepreneur: 'Entrepreneur',
  recruiter:    'Employer',
  investor:     'Investor',
};

const ROLE_CHIP = {
  jobseeker:    { emoji: '🎤', label: 'Jobseeker' },
  freelancer:   { emoji: '⚡', label: 'Freelancer' },
  entrepreneur: { emoji: '🚀', label: 'Entrepreneur' },
  recruiter:    { emoji: '🔍', label: 'Recruiter' },
  investor:     { emoji: '💼', label: 'Investor' },
};

// ─── DetailsScreen ───────────────────────────────────────────────────────────
const DetailsScreen = () => {
  const navigation = useNavigation();
  const { data: onboardingData, update } = useOnboarding();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const roleKey  = onboardingData?.role || 'jobseeker';
  const chipInfo = ROLE_CHIP[roleKey] || ROLE_CHIP.jobseeker;

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Please enter your name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing info', 'Please enter your email.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Missing info', 'Please create a password.');
      return;
    }

    const mappedRole = ROLE_MAP[roleKey] || 'Employee';

    const formData = new FormData();
    formData.append('firstName', name.trim());
    formData.append('email', email.trim().toLowerCase());
    formData.append('phoneNumber', phone.trim());
    formData.append('jobOption', mappedRole);
    formData.append('password', password);

    setLoading(true);
    try {
      await axios.post(
        `${env.baseURL}/api/users/signup/user`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );

      // Signup returns a plain string — auto-login to get a real token
      const loginRes = await axios.post(`${env.baseURL}/api/login`, {
        email: email.trim().toLowerCase(),
        password,
      });
      const { token } = loginRes.data;

      if (!token) throw new Error('Account created but login failed. Please sign in manually.');

      // Fetch user detail for userId + firstName
      const detailRes = await axios.get(`${env.baseURL}/api/user-detail`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { userId, firstName: fetchedName, profileUrl, profilePic, verification_status } = detailRes.data ?? {};

      await AsyncStorage.multiSet([
        ['userToken',           token],
        ['onboarded',           'true'],
        ['userId',              String(userId ?? '')],
        ['firstName',           fetchedName ?? name.trim()],
        ['profileUrl',          profileUrl ?? profilePic ?? ''],
        ['verification_status', String(verification_status ?? '')],
        ['jobOption',           mappedRole],
      ]);

      update({ step: 'done' });
      navigation.navigate('SuccessScreen');
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (typeof data === 'object' && data !== null && (data.message || data.error)) ||
        (typeof data === 'string' && data) ||
        err?.message ||
        'Something went wrong. Please try again.';
      Alert.alert('Sign-up failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── TOP HERO BAND ── */}
        <LinearGradient
          colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']}
          style={styles.hero}
        >
          {/* Header row: back btn + wordmark + step label */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <Image
              source={require('../assets/brand/wezume-wordmark-trimmed.png')}
              style={styles.wordmark}
              resizeMode="contain"
              tintColor="#fff"
            />

            <Text style={styles.stepLabel}>Step 2 of 3</Text>
          </View>

          {/* Step dots */}
          <View style={styles.dotsWrap}>
            <StepDots total={3} current={2} />
          </View>

          {/* Title */}
          <Text style={styles.heroTitle}>A few quick details.</Text>

          {/* Role chip */}
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{chipInfo.emoji} {chipInfo.label}</Text>
            </View>
            <Text style={styles.chipChange}> · change</Text>
          </View>
        </LinearGradient>

        {/* ── FORM SECTION (white) ── */}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LightInput
            placeholder="Display name"
            value={name}
            onChangeText={setName}
            iconLabel="👤"
            autoCapitalize="words"
            autoCorrect={false}
          />
          <LightInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            iconLabel="✉️"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <LightInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            iconLabel="📞"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <LightInput
            placeholder="Create password"
            value={password}
            onChangeText={setPassword}
            iconLabel="🔒"
            secureTextEntry
            showPasswordToggle
            autoCapitalize="none"
            autoCorrect={false}
          />

          <PasswordStrengthMeter password={password} />

          {/* T&C */}
          <Text style={styles.terms}>
            You agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text>
            {' '}& {' '}
            <Text style={styles.termsLink}>Privacy</Text>.
          </Text>
        </ScrollView>

        {/* ── STICKY BOTTOM ── */}
        <View style={styles.stickyBottom}>
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <LinearGradient
              colors={['#2AA9E5', '#1577B0']}
              style={styles.cta}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>
                {loading ? 'Creating…' : 'Create my wezume →'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {(roleKey === 'jobseeker' || roleKey === 'freelancer' || roleKey === 'entrepreneur') && (
            <View style={styles.linkedInRow}>
              <Text style={styles.linkedInOr}>Or </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.linkedInLink}>continue with LinkedIn</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#2AB6EE',
  },
  flex: { flex: 1, backgroundColor: '#fff' },

  // ── Hero band ──────────────────────────────────────────────────────
  hero: {
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
  wordmark: { height: 36, width: 126, marginLeft: 4 },
  stepLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
  },

  // Step dots
  dotsWrap: {
    marginTop: 10,
    alignItems: 'flex-start',
  },

  // Hero title
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 10,
    lineHeight: 30,
    letterSpacing: -0.5,
  },

  // Role chip row
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  chipChange: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 4,
  },

  // ── Form section ──────────────────────────────────────────────────
  formScroll: {
    padding: 22,
    paddingBottom: 16,
  },
  terms: {
    color: '#4A5568',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 8,
  },
  termsLink: {
    color: '#1577B0',
    fontWeight: '700',
  },

  // ── Sticky bottom ─────────────────────────────────────────────────
  stickyBottom: {
    borderTopWidth: 1,
    borderTopColor: '#E5ECF3',
    paddingTop: 12,
    paddingHorizontal: 22,
    paddingBottom: 28,
    backgroundColor: '#fff',
  },
  cta: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1577B0',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  linkedInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  linkedInOr: {
    color: WZ.ink3,
    fontSize: 12,
  },
  linkedInLink: {
    color: '#1E9BD7',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DetailsScreen;
