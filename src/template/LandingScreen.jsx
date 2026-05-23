import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Image, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { WZ } from '../theme';

const TAGLINES = [
  { line1: 'Skip the',  line2: 'résumé.'  },
  { line1: 'Hire by',   line2: 'vibe.'    },
  { line1: 'Show your', line2: 'story.'   },
  { line1: 'Land it in',line2: '60 sec.'  },
];

const AVATAR_INITIALS = ['A', 'S', 'M', 'P'];
const AVATAR_COLOR = 'rgba(255,255,255,0.22)';

const AvatarStack = () => (
  <View style={stack.row}>
    {AVATAR_INITIALS.map((init, i) => (
      <View
        key={i}
        style={[stack.circle, { marginLeft: i === 0 ? 0 : -8, zIndex: 4 - i }]}
      >
        <Text style={stack.initial}>{init}</Text>
      </View>
    ))}
  </View>
);

const stack = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  circle: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)', backgroundColor: AVATAR_COLOR },
  initial: { color: 'rgba(255,255,255,0.85)', fontSize: 7, fontWeight: '700' },
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

  const tag = TAGLINES[taglineIndex];

  return (
    <LinearGradient colors={['#1E9BD7', '#0E5A8E', '#06243F']} locations={[0, 0.5, 1]} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        {/* Topbar: wordmark left, Sign in pill right */}
        <View style={styles.topbar}>
          <Image
            source={require('../assets/brand/wezume-wordmark-trimmed.png')}
            style={styles.wordmark}
            resizeMode="contain"
            tintColor="#fff"
          />
          <TouchableOpacity
            style={styles.signInPill}
            onPress={() => navigation.navigate('LoginScreen')}
            activeOpacity={0.75}
          >
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>
        </View>

        {/* Center: mark + strapline + tagline + body */}
        <View style={styles.center}>
          <Image
            source={require('../assets/brand/wezume-mark.webp')}
            style={styles.mark}
            resizeMode="cover"
          />

          {/* Strapline */}
          <Text style={styles.strapline}>SPEAK UP. STAND OUT.</Text>

          {/* Two-line rotating tagline */}
          <Animated.View style={[styles.taglineBlock, { opacity: fadeAnim }]}>
            <Text style={styles.taglineLine1}>{tag.line1}</Text>
            <Text style={styles.taglineLine2}>{tag.line2}</Text>
          </Animated.View>

          {/* Body copy */}
          <Text style={styles.body}>
            Record a 60-second video. Get matched.{'\n'}
            Land roles, gigs, capital — by who you are,{'\n'}not what you wrote.
          </Text>
        </View>

        {/* Bottom: social proof + CTA + footer */}
        <View style={styles.bottom}>
          <View style={styles.socialRow}>
            <AvatarStack />
            <Text style={styles.socialText}>
              <Text style={styles.socialBold}>10,000+</Text>
              {' '}ditched the résumé
            </Text>
          </View>

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
  safe: { flex: 1, paddingHorizontal: 22 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  wordmark: { height: 36, width: 126 },
  signInPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  signInText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  mark: { width: 110, height: 110, borderRadius: 55, marginBottom: 16 },
  strapline: {
    color: WZ.yellow,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 14,
  },
  taglineBlock: { alignItems: 'center', marginBottom: 14 },
  taglineLine1: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 46,
    textAlign: 'center',
  },
  taglineLine2: {
    color: WZ.yellow,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 46,
    textAlign: 'center',
  },
  body: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottom: { paddingBottom: 32 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  socialText: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
  socialBold: { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  cta: {
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#FFC93A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: { color: WZ.ink, fontSize: 16, fontWeight: '800' },
  footer: { color: 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'center' },
});

export default LandingScreen;
