import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { WZ } from '../theme';

const { width } = Dimensions.get('window');

const TAGLINES = [
  "Skip the résumé.",
  "Hire by vibe.",
  "Show your story.",
  "Land it in 60 sec.",
];

const LandingScreen = () => {
  const navigation = useNavigation();
  const [taglineIndex, setTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex(i => (i + 1) % TAGLINES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <LinearGradient colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>
        {/* Sign in — top right */}
        <TouchableOpacity
          style={styles.signIn}
          onPress={() => navigation.navigate('LoginScreen')}
          activeOpacity={0.75}
        >
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        {/* Center content */}
        <View style={styles.center}>
          <Image
            source={require('../assets/brand/wezume-mark.webp')}
            style={styles.mark}
            resizeMode="cover"
          />
          <Text style={styles.strapline}>SPEAK UP. STAND OUT.</Text>
          <Text style={styles.tagline}>{TAGLINES[taglineIndex]}</Text>
          <Text style={styles.social}>10,000+ ditched the résumé</Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            onPress={() => navigation.navigate('RoleSelectScreen')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FFC93A', '#FF9F43']}
              style={styles.cta}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
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
  signIn: { alignSelf: 'flex-end', marginTop: 12, padding: 8 },
  signInText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  strapline: {
    color: WZ.yellow,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  tagline: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  social: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  bottom: { paddingBottom: 32 },
  cta: {
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaText: { color: WZ.ink, fontSize: 16, fontWeight: '800' },
  footer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LandingScreen;
