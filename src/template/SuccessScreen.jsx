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
    <LinearGradient colors={['#1E9BD7', '#0E5A8E', '#06243F']} locations={[0, 0.5, 1]} style={styles.container}>
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
          <Text style={styles.welcome}>
            <Text>Welcome, <Text style={{color:'#fff',fontWeight:'700'}}>{roleDisplay}</Text>.</Text>
          </Text>
          <Text style={styles.welcomeSub}>Now let's record your first take — 60 seconds, no script needed.</Text>

          {/* Glass checklist card */}
          <View style={styles.card}>
            {[
              { done: true,  next: false, num: 1, label: 'Account created' },
              { done: false, next: true,  num: 2, label: 'Record your first take' },
              { done: false, next: false, num: 3, label: 'Get your AI Review' },
            ].map((item, i) => (
              <View key={i} style={[styles.checkRow, i < 2 && styles.checkRowBorder]}>
                <View style={[styles.checkCircle,
                  item.done && { backgroundColor: WZ.green },
                  item.next && { backgroundColor: WZ.yellow },
                  !item.done && !item.next && { backgroundColor: 'rgba(255,255,255,0.1)' },
                ]}>
                  <Text style={[styles.checkNum, { color: item.done || item.next ? WZ.ink : 'rgba(255,255,255,0.4)' }]}>
                    {item.done ? '✓' : item.num}
                  </Text>
                </View>
                <Text style={[styles.checkLabel,
                  item.done && { color: 'rgba(255,255,255,0.5)', textDecorationLine: 'line-through' },
                  item.next && { color: '#fff', fontWeight: '700' },
                  !item.done && !item.next && { color: 'rgba(255,255,255,0.45)' },
                ]}>{item.label}</Text>
                {item.next && <Text style={styles.nextBadge}>NEXT</Text>}
              </View>
            ))}
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
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WZ.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#06243F',
  },
  badgeTick: { color: WZ.ink, fontSize: 13, fontWeight: '800' },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  headlineWhite: { color: '#fff', fontSize: 34, fontWeight: '800' },
  headlineYellow: { color: WZ.yellow, fontSize: 34, fontWeight: '800' },
  welcome: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    marginBottom: 8,
  },
  welcomeSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 280, marginBottom: 24 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    padding: 16,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkNum: { fontSize: 11, fontWeight: '800' },
  checkLabel: { flex: 1, fontSize: 13 },
  nextBadge: { color: WZ.yellow, fontSize: 10, fontWeight: '700', marginLeft: 'auto' },
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
