import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

const AVATAR_SIZE = 52;
const AVATAR_MARGIN = 8;
const ITEM_WIDTH = AVATAR_SIZE + AVATAR_MARGIN * 2;

const ROW1 = [
  { init: 'AK', color: '#2AB6EE' },
  { init: 'SR', color: '#FF6B6B' },
  { init: 'MJ', color: '#2CC6A1' },
  { init: 'PK', color: '#FFC93A' },
  { init: 'RV', color: '#9B59B6' },
  { init: 'NB', color: '#E67E22' },
  { init: 'LP', color: '#1E9BD7' },
  { init: 'TM', color: '#27AE60' },
];

const ROW2 = [
  { init: 'DG', color: '#E74C3C' },
  { init: 'SN', color: '#3498DB' },
  { init: 'VR', color: '#F39C12' },
  { init: 'KP', color: '#16A085' },
  { init: 'AR', color: '#8E44AD' },
  { init: 'HS', color: '#2980B9' },
  { init: 'BT', color: '#D35400' },
  { init: 'CL', color: '#27AE60' },
];

const AvatarChip = ({ init, color }) => (
  <View style={[styles.avatar, { backgroundColor: color }]}>
    <Text style={styles.initials}>{init}</Text>
  </View>
);

const MarqueeRow = ({ data, reverse = false }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const totalWidth = ITEM_WIDTH * data.length;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(anim, {
        toValue: reverse ? totalWidth : -totalWidth,
        duration: 12000,
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
          <View key={i} style={styles.item}>
            <AvatarChip init={a.init} color={a.color} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const MarqueeAvatars = () => (
  <View style={styles.container}>
    <MarqueeRow data={ROW1} />
    <MarqueeRow data={ROW2} reverse />
  </View>
);

const styles = StyleSheet.create({
  container: { overflow: 'hidden', marginVertical: 8 },
  rowContainer: { overflow: 'hidden', marginVertical: 4 },
  row: { flexDirection: 'row' },
  item: { marginHorizontal: AVATAR_MARGIN },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default MarqueeAvatars;
