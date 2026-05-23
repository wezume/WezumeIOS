import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { WZ } from '../theme';
import StepDots from '../components/StepDots';
import { useOnboarding } from './OnboardingContext';

const ROLE_DISPLAY = {
  jobseeker:    '🎤 Jobseeker',
  freelancer:   '💻 Freelancer',
  entrepreneur: '🚀 Entrepreneur',
  recruiter:    '🔍 Recruiter',
  investor:     '💼 Investor',
};

const SuccessScreen = () => {
  const navigation = useNavigation();
  const { data: onboardingData, clear } = useOnboarding();

  const roleKey     = onboardingData?.role || 'jobseeker';
  const roleDisplay = ROLE_DISPLAY[roleKey] || ROLE_DISPLAY.jobseeker;

  const handleRecord = () => {
    clear();
    navigation.navigate('CameraPage');
  };

  const handleSkip = () => {
    clear();
    navigation.navigate('HomeScreen');
  };

  return (
    <LinearGradient colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>
        {/* Step indicator */}
        <View style={styles.header}>
          <StepDots total={3} current={3} />
        </View>

        {/* Center content */}
        <View style={styles.center}>
          {/* Avatar + checkmark badge */}
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../assets/brand/wezume-mark.webp')}
              style={styles.mark}
              resizeMode="cover"
            />
            <View style={styles.badge}>
              <Text style={styles.badgeTick}>✓</Text>
            </View>
          </View>

          {/* Headline */}
          <View style={styles.headlineRow}>
            <Text style={styles.headlineWhite}>You're </Text>
            <Text style={styles.headlineYellow}>in.</Text>
          </View>

          {/* Personalized welcome */}
          <Text style={styles.welcome}>Welcome, {roleDisplay}.</Text>

          {/* Glass checklist card */}
          <View style={styles.card}>
            <Text style={styles.checkDone}>✓  Account created</Text>

            <View style={styles.nextRow}>
              <View style={styles.nextAccent} />
              <View style={styles.nextContent}>
                <Text style={styles.nextStep}>2 · Record your first take</Text>
              </View>
            </View>

            <Text style={styles.futureStep}>3 · Get your AI Review</Text>
          </View>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottom}>
          <TouchableOpacity onPress={handleRecord} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FFC93A', '#FF9F43']}
              style={styles.cta}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>Record my first take</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now — explore the app</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  header: {
    paddingTop: 16,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  mark: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: WZ.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E9BD7',
  },
  badgeTick: { color: WZ.ink, fontSize: 13, fontWeight: '800' },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  headlineWhite: { color: '#fff', fontSize: 30, fontWeight: '800' },
  headlineYellow: { color: WZ.yellow, fontSize: 30, fontWeight: '800' },
  welcome: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  checkDone: {
    color: WZ.green,
    fontSize: 14,
    fontWeight: '600',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
    backgroundColor: WZ.yellow,
  },
  nextContent: { flex: 1 },
  nextStep: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  futureStep: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
  },
  bottom: { paddingBottom: 36 },
  cta: {
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  ctaText: { color: WZ.ink, fontSize: 16, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

export default SuccessScreen;
