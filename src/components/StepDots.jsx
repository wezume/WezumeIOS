import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WZ } from '../theme';

const StepDots = ({ current = 1, total = 3 }) => (
  <View style={styles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          i + 1 === current ? styles.active : styles.inactive,
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  active: { width: 20, backgroundColor: WZ.yellow },
  inactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.4)' },
});

export default StepDots;
