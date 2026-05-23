import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WZ } from '../theme';

const getStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
};

const COLORS = ['transparent', WZ.coral, WZ.amber, WZ.yellow, WZ.green];

const PasswordStrengthMeter = ({ password }) => {
  const strength = getStrength(password);
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          style={[
            styles.segment,
            { backgroundColor: i <= strength ? COLORS[strength] : 'rgba(255,255,255,0.12)' },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});

export default PasswordStrengthMeter;
