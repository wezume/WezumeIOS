import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { WZ } from '../theme';
import StepDots from '../components/StepDots';
import MarqueeAvatars from '../components/MarqueeAvatars';
import { useOnboarding } from './OnboardingContext';

const ROLES = [
  { id: 'jobseeker',     label: 'Jobseeker',     emoji: '🎤', desc: 'Find your next role',       color: WZ.blue },
  { id: 'freelancer',    label: 'Freelancer',    emoji: '💻', desc: 'Win your next project',     color: WZ.green },
  { id: 'entrepreneur',  label: 'Entrepreneur',  emoji: '🚀', desc: 'Pitch your vision',         color: WZ.coral },
  { id: 'recruiter',     label: 'Recruiter',     emoji: '🔍', desc: 'Find top talent',           color: WZ.amber },
  { id: 'investor',      label: 'Investor',      emoji: '💼', desc: 'Spot the next big thing',   color: '#9B59B6' },
];

const RoleSelectScreen = () => {
  const navigation = useNavigation();
  const { update } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelectRole = (tile) => {
    setSelectedRole(tile.id);
    update({ role: tile.id, step: 'details' });
    setTimeout(() => {
      navigation.navigate('DetailsScreen');
    }, 480);
  };

  const RoleTile = ({ tile }) => {
    const isSelected = selectedRole === tile.id;
    return (
      <TouchableOpacity
        style={[
          styles.tile,
          isSelected && {
            borderColor: tile.color,
            backgroundColor: tile.color + '26',
          },
        ]}
        onPress={() => handleSelectRole(tile)}
        activeOpacity={0.75}
      >
        <Text style={styles.tileEmoji}>{tile.emoji}</Text>
        <Text style={styles.tileLabel}>{tile.label}</Text>
        <Text style={styles.tileDesc}>{tile.desc}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#03152A', '#06243F', '#093E66', '#0E5A8E']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>
        {/* Header row */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.stepLabel}>Step 1 of 3</Text>
          <StepDots total={3} current={1} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Marquee hero */}
          <MarqueeAvatars />

          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={styles.titleWhite}>Pick your </Text>
            <Text style={styles.titleYellow}>lane.</Text>
          </View>
          <Text style={styles.subtitle}>One choice. Make it count.</Text>

          {/* Role tiles grid */}
          <View style={styles.grid}>
            {/* HIRE section */}
            <View style={styles.sectionRow}>
              <View style={[styles.sectionDot, { backgroundColor: WZ.coral }]} />
              <Text style={styles.sectionLabel}>HIRE</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.gridRow}>
              <RoleTile tile={ROLES[3]} />
              <RoleTile tile={ROLES[4]} />
            </View>

            {/* BUILD section */}
            <View style={[styles.sectionRow, styles.sectionRowSpaced]}>
              <View style={[styles.sectionDot, { backgroundColor: WZ.green }]} />
              <Text style={styles.sectionLabel}>BUILD</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.gridRow}>
              <RoleTile tile={ROLES[0]} />
              <RoleTile tile={ROLES[1]} />
            </View>
            <View style={styles.gridRowCenter}>
              <View style={styles.tileCentered}>
                <RoleTile tile={ROLES[2]} />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { color: '#fff', fontSize: 20, fontWeight: '600' },
  stepLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginRight: 4 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    marginBottom: 6,
  },
  titleWhite: { color: '#fff', fontSize: 28, fontWeight: '800' },
  titleYellow: { color: WZ.yellow, fontSize: 28, fontWeight: '800' },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 24,
  },
  grid: { gap: 12 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: -4,
  },
  sectionRowSpaced: { marginTop: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tileCentered: { width: '48%' },
  tile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 14,
  },
  tileEmoji: { fontSize: 28, marginBottom: 6 },
  tileLabel: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  tileDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
});

export default RoleSelectScreen;
