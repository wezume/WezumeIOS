import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { WZ } from '../theme';

const WzInput = ({ style, ...props }) => (
  <TextInput
    placeholderTextColor="rgba(255,255,255,0.45)"
    style={[styles.input, style]}
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});

export default WzInput;
