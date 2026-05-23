import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WZ } from '../theme';

const VerifiedBadge = () => (
  <View style={styles.badge}>
    <View style={styles.tick} />
  </View>
);

// Simple SVG-style tick using a rotated View (no SVG dependency)
const styles = StyleSheet.create({
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: WZ.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: 7,
    height: 4,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#fff',
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
});

export default VerifiedBadge;
