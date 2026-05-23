import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const CARD_W = 64;
const CARD_H = 80;
const CARD_GAP = 8;
const ITEM_WIDTH = CARD_W + CARD_GAP;

const ROW1 = [
  { init: 'AK', bg: '#2AB6EE', role: '🎤' },
  { init: 'SR', bg: '#FF6B6B', role: '💻' },
  { init: 'MJ', bg: '#2CC6A1', role: '🚀' },
  { init: 'PK', bg: '#FFC93A', role: '🔍' },
  { init: 'RV', bg: '#9B59B6', role: '💼' },
  { init: 'NB', bg: '#E67E22', role: '🎤' },
  { init: 'LP', bg: '#1E9BD7', role: '💻' },
  { init: 'TM', bg: '#27AE60', role: '🚀' },
];

const ROW2 = [
  { init: 'DG', bg: '#E74C3C', role: '🔍' },
  { init: 'SN', bg: '#3498DB', role: '💼' },
  { init: 'VR', bg: '#F39C12', role: '🎤' },
  { init: 'KP', bg: '#16A085', role: '💻' },
  { init: 'AR', bg: '#8E44AD', role: '🚀' },
  { init: 'HS', bg: '#2980B9', role: '🔍' },
  { init: 'BT', bg: '#D35400', role: '💼' },
  { init: 'CL', bg: '#27AE60', role: '🎤' },
];

const PortraitCard = ({ init, bg, role }) => (
  <View style={[styles.card, { backgroundColor: bg }]}>
    <Text style={styles.roleEmoji}>{role}</Text>
    <Text style={styles.initials}>{init}</Text>
  </View>
);

const MarqueeRow = ({ data, reverse = false, duration = 24000 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const totalWidth = ITEM_WIDTH * data.length;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(anim, {
        toValue: reverse ? totalWidth : -totalWidth,
        duration,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const doubled = [...data, ...data];

  return (
    <View style={styles.rowContainer}>
      <Animated.View style={[styles.row, { transform: [{ translateX: anim }] }]}>
        {doubled.map((a, i) => (
          <View key={i} style={styles.cardWrapper}>
            <PortraitCard init={a.init} bg={a.bg} role={a.role} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const MarqueeAvatars = () => (
  <View style={styles.container}>
    <MarqueeRow data={ROW1} duration={24000} />
    <MarqueeRow data={ROW2} reverse duration={28000} />
    {/* Left fade edge */}
    <LinearGradient
      colors={['#03152A', 'transparent']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.fadeLeft}
      pointerEvents="none"
    />
    {/* Right fade edge */}
    <LinearGradient
      colors={['transparent', '#0E5A8E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.fadeRight}
      pointerEvents="none"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 168,
    overflow: 'hidden',
    marginVertical: 8,
  },
  rowContainer: {
    overflow: 'hidden',
    marginVertical: 3,
    height: CARD_H,
  },
  row: { flexDirection: 'row' },
  cardWrapper: { marginHorizontal: CARD_GAP / 2 },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  roleEmoji: { fontSize: 22, marginBottom: 4 },
  initials: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  fadeLeft: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: 52,
  },
  fadeRight: {
    position: 'absolute',
    top: 0, bottom: 0, right: 0,
    width: 52,
  },
});

export default MarqueeAvatars;
