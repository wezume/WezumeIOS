import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { WZ } from '../theme';

const TAGLINES = [
  'Skip the résumé.',
  'Hire by vibe.',
  'Show your story.',
  'Land it in 60 sec.',
];

const AVATAR_COLORS = ['#2AB6EE', '#FF6B6B', '#2CC6A1', '#FFC93A', '#9B59B6'];
const AVATAR_INITIALS = ['A', 'S', 'M', 'P', 'R'];

const AvatarStack = () => (
  <View style={stack.row}>
    {AVATAR_COLORS.map((color, i) => (
      <View
        key={i}
        style={[stack.circle, { backgroundColor: color, marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i }]}
      >
        <Text style={stack.initial}>{AVATAR_INITIALS[i]}</Text>
      </View>
    ))}
  </View>
);

const stack = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  circle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1E9BD7' },
  initial: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

const LandingScreen = () => {
  const navigation = useNavigation();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setTaglineIndex(i => (i + 1) % TAGLINES.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        {/* Topbar: wordmark left + sign in right */}
        <View style={styles.topbar}>
          <Text style={styles.wordmark}>wezume</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} activeOpacity={0.75}>
            <Text style={styles.signIn}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Image
            source={require('../assets/brand/wezume-mark.webp')}
            style={styles.mark}
            resizeMode="cover"
          />

          {/* Strapline with hairlines */}
          <View style={styles.straplineRow}>
            <View style={styles.hairline} />
            <Text style={styles.strapline}>SPEAK UP. STAND OUT.</Text>
            <View style={styles.hairline} />
          </View>

          {/* Rotating tagline */}
          <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
            {TAGLINES[taglineIndex]}
          </Animated.Text>

          {/* Body copy */}
          <Text style={styles.body}>
            Record a 60-second video. Get matched.{'\n'}
            Land roles, gigs, capital — by who you are,{'\n'}
            not what you write.
          </Text>

          {/* Avatar stack + social proof */}
          <View style={styles.socialRow}>
            <AvatarStack />
            <Text style={styles.socialText}>10,000+ ditched the résumé</Text>
          </View>
        </View>

        {/* Bottom */}
        <View style={styles.bottom}>
          <TouchableOpacity onPress={() => navigation.navigate('RoleSelectScreen')} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FFC93A', '#FF9F43']}
              style={styles.cta}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaText}>Level up →</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.footer}>✨ 60 seconds. No résumé. No script.</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 4,
  },
  wordmark: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  signIn: { color: '#fff', fontSize: 14, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 96, height: 96, borderRadius: 48, marginBottom: 18 },
  straplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  hairline: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  strapline: {
    color: WZ.yellow,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  tagline: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  body: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  socialRow: { alignItems: 'center', gap: 8 },
  socialText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  bottom: { paddingBottom: 36 },
  cta: {
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#FFC93A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: { color: WZ.ink, fontSize: 16, fontWeight: '800' },
  footer: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center' },
});

export default LandingScreen;
