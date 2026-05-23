import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { WZ } from '../theme';
import StepDots from '../components/StepDots';
import WzInput from '../components/WzInput';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { useOnboarding } from './OnboardingContext';
import env from './env';

const ROLE_MAP = {
  jobseeker:    'Employee',
  freelancer:   'Freelancer',
  entrepreneur: 'Entrepreneur',
  recruiter:    'Employer',
  investor:     'Investor',
};

const ROLE_CHIP = {
  jobseeker:    { emoji: '🎤', label: 'Jobseeker' },
  freelancer:   { emoji: '💻', label: 'Freelancer' },
  entrepreneur: { emoji: '🚀', label: 'Entrepreneur' },
  recruiter:    { emoji: '🔍', label: 'Recruiter' },
  investor:     { emoji: '💼', label: 'Investor' },
};

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

    setLoading(true);
    try {
      const response = await axios.post(`${env.baseURL}/api/signup`, {
        role:     mappedRole,
        name:     name.trim(),
        email:    email.trim().toLowerCase(),
        phone:    phone.trim(),
        password,
      });

      const { token, verification_status } = response.data;

      await AsyncStorage.multiSet([
        ['userToken',            token ?? ''],
        ['verification_status',  String(verification_status ?? '')],
        ['onboarded',            'true'],
      ]);

      update({ step: 'done' });
      navigation.navigate('SuccessScreen');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong. Please try again.';
      Alert.alert('Sign-up failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <StepDots total={3} current={2} />
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>{chipInfo.emoji} {chipInfo.label}</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Create your wezume.</Text>

            {/* Form */}
            <View style={styles.form}>
              <WzInput
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <WzInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <WzInput
                placeholder="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <WzInput
                placeholder="Create password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <PasswordStrengthMeter password={password} />
            </View>

            {/* T&C */}
            <Text style={styles.terms}>
              By continuing you agree to our Terms &amp; Privacy.
            </Text>

            {/* Primary CTA */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
              style={styles.ctaWrapper}
            >
              <LinearGradient
                colors={['#FFC93A', '#FF9F43']}
                style={styles.cta}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>
                  {loading ? 'Creating…' : 'Create my wezume →'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* LinkedIn link */}
            <TouchableOpacity style={styles.linkedInBtn} activeOpacity={0.7}>
              <Text style={styles.linkedInText}>Or continue with LinkedIn</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { color: '#fff', fontSize: 20, fontWeight: '600' },
  roleChip: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 48,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
  },
  form: { gap: 12, marginBottom: 16 },
  terms: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaWrapper: { marginBottom: 16 },
  cta: {
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: WZ.ink, fontSize: 16, fontWeight: '800' },
  linkedInBtn: { alignItems: 'center', paddingVertical: 8 },
  linkedInText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default DetailsScreen;
