import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WZ } from '../theme';

const DISMISSED_KEY = 'wz_verify_banner_dismissed';

const VerifyBanner = ({ onResend }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DISMISSED_KEY).then(val => {
      if (val !== 'true') setVisible(true);
    });
  }, []);

  const dismiss = () => {
    AsyncStorage.setItem(DISMISSED_KEY, 'true').catch(() => {});
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Verify your email to unlock matches</Text>
      <View style={styles.actions}>
        {onResend && (
          <TouchableOpacity onPress={onResend}>
            <Text style={styles.link}>Resend</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={dismiss}>
          <Text style={styles.dismiss}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,201,58,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,201,58,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { fontSize: 13, fontWeight: '600', color: WZ.ink, flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  link: { fontSize: 13, fontWeight: '700', color: WZ.blue },
  dismiss: { fontSize: 14, color: WZ.ink2, fontWeight: '700' },
});

export default VerifyBanner;
