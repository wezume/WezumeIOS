import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, Easing, StyleSheet } from 'react-native';

const CARD_W = 72;
const CARD_H = 96;
const CARD_GAP = 10;
const ITEM_WIDTH = CARD_W + CARD_GAP;

const ROW1 = [
  { name: 'Vikram',  init: 'V', bg: '#4CAFD8' },
  { name: 'Aarav',   init: 'A', bg: '#D97878' },
  { name: 'Priya',   init: 'P', bg: '#45B89A' },
  { name: 'Rohan',   init: 'R', bg: '#D4A83C' },
  { name: 'Sneha',   init: 'S', bg: '#8E6AAE' },
  { name: 'Kiran',   init: 'K', bg: '#C97030' },
  { name: 'Dev',     init: 'D', bg: '#3A8FC2' },
  { name: 'Meera',   init: 'M', bg: '#3A9E6A' },
];

const ROW2 = [
  { name: 'Ananya',  init: 'A', bg: '#C25050' },
  { name: 'Karthik', init: 'K', bg: '#4A8ABE' },
  { name: 'Diya',    init: 'D', bg: '#C49030' },
  { name: 'Ishaan',  init: 'I', bg: '#349080' },
  { name: 'Riya',    init: 'R', bg: '#7A50A0' },
  { name: 'Arjun',   init: 'A', bg: '#3478A8' },
  { name: 'Nisha',   init: 'N', bg: '#B86030' },
  { name: 'Tarun',   init: 'T', bg: '#389060' },
];

const ProfileCard = ({ name, init, bg }) => (
  <View style={[styles.card, { backgroundColor: bg }]}>
    {/* Wezume icon top-right */}
    <Image
      source={require('../assets/brand/wezume-icon.png')}
      style={styles.cardLogo}
      resizeMode="contain"
      tintColor="rgba(255,255,255,0.75)"
    />
    {/* Person silhouette */}
    <View style={styles.personWrap}>
      <View style={styles.head}>
        <Text style={styles.headInitial}>{init}</Text>
      </View>
      <View style={styles.shoulders} />
    </View>
    <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
  </View>
);

const MarqueeRow = ({ data, reverse = false, duration = 24000 }) => {
  const totalWidth = ITEM_WIDTH * data.length;
  const anim = useRef(new Animated.Value(reverse ? -totalWidth : 0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(anim, {
        toValue: reverse ? 0 : -totalWidth,
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
            <ProfileCard name={a.name} init={a.init} bg={a.bg} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const MarqueeAvatars = () => (
  <View style={styles.container}>
    <MarqueeRow data={ROW1} duration={26000} />
    <MarqueeRow data={ROW2} reverse duration={30000} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 212,
    overflow: 'hidden',
    marginHorizontal: -20,
    marginVertical: 8,
  },
  rowContainer: {
    height: CARD_H,
    marginVertical: 4,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', paddingLeft: 20 },
  cardWrapper: { marginHorizontal: CARD_GAP / 2 },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    paddingTop: 6,
    overflow: 'hidden',
  },
  cardLogo: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
  },
  personWrap: {
    alignItems: 'center',
    marginBottom: 6,
  },
  head: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  headInitial: { color: '#fff', fontSize: 15, fontWeight: '800' },
  shoulders: {
    width: 52,
    height: 20,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cardName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default MarqueeAvatars;
