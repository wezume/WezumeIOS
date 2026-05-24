import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, StatusBar, Image, Alert,
  ActivityIndicator, Platform, Linking,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import apiClient from './api';

const WZ = {
  blue: '#1E9BD7', blueDeep: '#0E5A8E', navy: '#0B2138',
  yellow: '#FFC93A', green: '#2CC6A1', purple: '#7C5CE7',
  amber: '#FF9F43',
  blueLight: '#E6F5FB', purpleLight: '#EEE9FF',
  greenLight: '#E4F9F5', amberLight: '#FFF4EB',
  ink: '#0B1623', ink2: '#4A5A70', ink3: '#8B97A8',
  line: '#E5ECF3', bg: '#F4F8FC', card: '#FFFFFF',
};

const EDUCATION_CHIPS = [
  { label: 'Engg',        value: 'Engineering' },
  { label: 'MBA',         value: 'MBA' },
  { label: 'Any Masters', value: 'Masters' },
  { label: 'Any UG',      value: 'UG' },
];

const EXPERIENCE_CHIPS = [
  { label: 'Fresher', value: 'Fresher' },
  { label: '< 1yr',   value: '<1' },
  { label: '1–2 yrs', value: '1-2' },
  { label: '3–6 yrs', value: '3-6' },
  { label: '6–9 yrs', value: '6-9' },
  { label: '10+ yrs', value: '10+' },
];

const INDUSTRY_CHIPS = [
  { label: 'IT/ITES',       icon: 'computer' },
  { label: 'Media',         icon: 'movie' },
  { label: 'Hospitality',   icon: 'hotel' },
  { label: 'Transport',     icon: 'flight' },
  { label: 'Real Estate',   icon: 'business' },
  { label: 'Healthcare',    icon: 'local-hospital' },
  { label: 'BFSI',          icon: 'account-balance' },
  { label: 'Education',     icon: 'school' },
  { label: 'Startups',      icon: 'trending-up' },
  { label: 'Manufacturing', icon: 'precision-manufacturing' },
  { label: 'Retail',        icon: 'shopping-cart' },
  { label: 'Others',        icon: 'category' },
];

// Standard link types shown as chips; tap to reveal their input
const LINK_TYPES = [
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'linkedin.com/in/yourname' },
  { key: 'github',    label: 'GitHub',    placeholder: 'github.com/yourname' },
  { key: 'portfolio', label: 'Portfolio', placeholder: 'yoursite.com' },
  { key: 'blog',      label: 'Blog',      placeholder: 'yourblog.com' },
];

const CompletionRing = ({ pct, size = 104, children }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }} pointerEvents="none">
        <Circle cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.2)" strokeWidth={5} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r}
          stroke={WZ.yellow} strokeWidth={5} fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round" />
      </Svg>
      {children}
    </View>
  );
};

const Section = ({ accent, bg, label, summary, expanded, onToggle, children }) => (
  <View style={[styles.card, expanded && { borderColor: `${accent}50` }]}>
    <TouchableOpacity
      style={[styles.sectionHeader, { backgroundColor: expanded ? `${accent}22` : `${accent}12` }]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={[styles.sectionDot, { backgroundColor: accent }]} />
      <Text style={[styles.sectionLabel, { color: accent }]}>{label}</Text>
      {!expanded && summary
        ? <Text style={[styles.sectionSummary, { color: accent }]} numberOfLines={1}>{summary}</Text>
        : null}
    </TouchableOpacity>
    {expanded && (
      <View style={[styles.expandBody, { backgroundColor: bg }]}>
        {children}
      </View>
    )}
  </View>
);

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [userId, setUserId]               = useState(null);
  const [firstName, setFirstName]         = useState('');
  const [profileUrl, setProfileUrl]       = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [education, setEducation]         = useState('');
  const [currentRole, setCurrentRole]     = useState('');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [experience, setExperience]       = useState('');
  const [industry, setIndustry]           = useState('');
  // link values keyed by LINK_TYPES[].key
  const [linkValues, setLinkValues]       = useState({ linkedin: '', github: '', portfolio: '', blog: '' });
  const [otherLinks, setOtherLinks]       = useState([]); // [{id, value}]
  const [activeLink, setActiveLink]       = useState(null); // key of expanded link tag
  const [loading, setLoading]             = useState(true);
  const [saveState, setSaveState]         = useState('idle');
  const [expanded, setExpanded]           = useState(null);

  const debounceRef = useRef(null);

  const completionPct = (() => {
    const fields = [firstName, education, experience, currentRole, industry, !!(profileUrl || selectedImage)];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

  useEffect(() => {
    const load = async () => {
      try {
        const id   = await AsyncStorage.getItem('userId');
        const name = await AsyncStorage.getItem('firstName');
        const pic  = await AsyncStorage.getItem('profileUrl');
        if (!id) { navigation.replace('LoginScreen'); return; }
        setUserId(parseInt(id, 10));
        setFirstName(name || '');
        setProfileUrl(pic || null);

        const res = await apiClient.get('/api/user-detail');
        const d = res.data ?? {};
        setEducation(d.education || '');
        setCurrentRole(d.currentRole || d.currentDesignation || '');
        setCurrentEmployer(d.currentEmployer || d.companyName || '');
        setExperience(d.experience || '');
        if (d.industry) setIndustry(d.industry.split(',')[0].trim());
        setLinkValues({
          linkedin:  d.linkedIn  || d.linkedin  || '',
          github:    d.github    || '',
          portfolio: d.portfolio || d.website   || '',
          blog:      d.blog      || '',
        });
      } catch (e) {
        console.error('EditProfile load:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigation]);

  const autoSave = useCallback((patch) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveState('saving');
    debounceRef.current = setTimeout(async () => {
      try {
        const fd = new FormData();
        Object.entries(patch).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
        if (selectedImage) fd.append('profilePic', selectedImage);
        await apiClient.put(`/api/users/update/${userId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setSaveState('saved');
      } catch (_) { setSaveState('idle'); }
    }, 1500);
  }, [userId, selectedImage]);

  const buildPayload = (overrides = {}) => ({
    education, currentRole, currentEmployer, experience, industry,
    linkedIn: linkValues.linkedin, github: linkValues.github,
    portfolio: linkValues.portfolio, blog: linkValues.blog,
    otherLinks: otherLinks.map(o => o.value).filter(Boolean).join(','),
    ...overrides,
  });

  const handleEduSelect = v => {
    setEducation(v);
    autoSave(buildPayload({ education: v }));
    setExpanded(null);
  };

  const handleExpSelect = v => {
    setExperience(v);
    autoSave(buildPayload({ experience: v }));
    if (v === 'Fresher') setExpanded(null);
  };

  const handleIndustrySelect = label => {
    setIndustry(label);
    autoSave(buildPayload({ industry: label }));
    setExpanded(null);
  };

  const handleLinkChange = (key, value) => {
    const next = { ...linkValues, [key]: value };
    setLinkValues(next);
    autoSave(buildPayload({
      linkedIn: next.linkedin, github: next.github,
      portfolio: next.portfolio, blog: next.blog,
    }));
  };

  const addOtherLink = () => {
    setOtherLinks(prev => [...prev, { id: Date.now(), value: '' }]);
  };

  const updateOtherLink = (id, value) => {
    const next = otherLinks.map(o => o.id === id ? { ...o, value } : o);
    setOtherLinks(next);
    autoSave(buildPayload({ otherLinks: next.map(o => o.value).filter(Boolean).join(',') }));
  };

  const removeOtherLink = id => {
    const next = otherLinks.filter(o => o.id !== id);
    setOtherLinks(next);
    autoSave(buildPayload({ otherLinks: next.map(o => o.value).filter(Boolean).join(',') }));
  };

  const handlePickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.[0]) {
        const a = res.assets[0];
        setSelectedImage({ uri: a.uri, type: a.type, name: a.fileName || 'profile.jpg' });
        setProfileUrl(a.uri);
        autoSave(buildPayload());
      }
    });
  };

  const handleDone = async () => {
    try {
      const fd = new FormData();
      Object.entries(buildPayload()).forEach(([k, v]) => v !== undefined && fd.append(k, String(v)));
      if (selectedImage) fd.append('profilePic', selectedImage);
      await apiClient.put(`/api/users/update/${userId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (profileUrl) await AsyncStorage.setItem('profileUrl', profileUrl);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Could not save changes.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: WZ.bg }}>
        <ActivityIndicator size="large" color={WZ.blue} />
      </View>
    );
  }

  const toggle = key => setExpanded(expanded === key ? null : key);
  const isFresher = experience === 'Fresher';
  const expLabel  = EXPERIENCE_CHIPS.find(c => c.value === experience)?.label;
  const eduLabel  = EDUCATION_CHIPS.find(c => c.value === education)?.label;
  const indChip   = INDUSTRY_CHIPS.find(c => c.label === industry);
  const filledLinks = LINK_TYPES.filter(t => linkValues[t.key]).map(t => t.label);
  const linkSummary = filledLinks.length > 0 ? filledLinks.join(' · ') : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={{ flex: 1, backgroundColor: WZ.bg }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 48, minHeight: '100%' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {/* Hero */}
          <LinearGradient colors={['#2AB6EE', '#1E9BD7', '#0E5A8E']} style={styles.hero}>
            <View style={styles.headerRow}>
              {navigation.canGoBack() && (
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                  <MaterialIcons name="arrow-back" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 }}>
                <Text style={styles.headerTitle}>Your stage</Text>
                <MaterialIcons name="mic" size={16} color="rgba(255,255,255,0.8)" />
              </View>
              <Image
                source={require('../assets/brand/wezume-wordmark-trimmed.png')}
                style={styles.wordmark} resizeMode="contain" tintColor="#fff"
              />
            </View>

            <View style={styles.heroBody}>
              <View style={styles.avatarArea}>
                <CompletionRing pct={completionPct} size={80}>
                  <View style={styles.avatarInner}>
                    {profileUrl
                      ? <Image source={{ uri: profileUrl }} style={styles.avatar} />
                      : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                          <Text style={styles.avatarInitial}>{(firstName || 'U')[0].toUpperCase()}</Text>
                        </View>
                      )
                    }
                  </View>
                </CompletionRing>
                <TouchableOpacity style={styles.cameraBadge} onPress={handlePickPhoto} activeOpacity={0.8}>
                  <MaterialIcons name="camera-alt" size={13} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>{firstName}</Text>
                <View style={styles.completionPill}>
                  <Text style={styles.completionPillText}>{completionPct}% complete</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={{ backgroundColor: WZ.bg, padding: 16, gap: 10 }}>

            {/* EDUCATION */}
            <Section
              accent={WZ.amber} bg={WZ.amberLight}
              label="EDUCATION" summary={eduLabel}
              expanded={expanded === 'education'}
              onToggle={() => toggle('education')}
            >
              <View style={styles.chipRow}>
                {EDUCATION_CHIPS.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.chip, education === c.value && { borderColor: WZ.amber, backgroundColor: `${WZ.amber}20` }]}
                    onPress={() => handleEduSelect(c.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, education === c.value && { color: WZ.amber, fontWeight: '700' }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            {/* EXPERIENCE */}
            <Section
              accent={WZ.blue} bg={WZ.blueLight}
              label="EXPERIENCE"
              summary={[expLabel, !isFresher && currentRole, !isFresher && currentEmployer].filter(Boolean).join(' · ')}
              expanded={expanded === 'experience'}
              onToggle={() => toggle('experience')}
            >
              <View style={styles.chipRow}>
                {EXPERIENCE_CHIPS.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.chip, experience === c.value && { borderColor: WZ.blue, backgroundColor: `${WZ.blue}18` }]}
                    onPress={() => handleExpSelect(c.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, experience === c.value && { color: WZ.blue, fontWeight: '700' }]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {experience && !isFresher && (
                <>
                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Current role</Text>
                  <TextInput
                    style={[styles.input, { borderColor: `${WZ.blue}30` }]}
                    placeholder="Job title / Role"
                    placeholderTextColor={WZ.ink3}
                    value={currentRole}
                    onChangeText={v => { setCurrentRole(v); autoSave(buildPayload({ currentRole: v })); }}
                    autoCapitalize="words"
                  />
                  <Text style={styles.fieldLabel}>Company / Organisation</Text>
                  <TextInput
                    style={[styles.input, { borderColor: `${WZ.blue}30`, marginBottom: 0 }]}
                    placeholder="@ Where you work"
                    placeholderTextColor={WZ.ink3}
                    value={currentEmployer}
                    onChangeText={v => { setCurrentEmployer(v); autoSave(buildPayload({ currentEmployer: v })); }}
                    autoCapitalize="words"
                  />
                </>
              )}
            </Section>

            {/* INDUSTRY */}
            <Section
              accent={WZ.purple} bg={WZ.purpleLight}
              label="INDUSTRY"
              summary={indChip ? indChip.label : null}
              expanded={expanded === 'industry'}
              onToggle={() => toggle('industry')}
            >
              <View style={styles.chipRow}>
                {INDUSTRY_CHIPS.map(c => (
                  <TouchableOpacity
                    key={c.label}
                    style={[styles.chip, industry === c.label && { borderColor: WZ.purple, backgroundColor: `${WZ.purple}18` }]}
                    onPress={() => handleIndustrySelect(c.label)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialIcons
                        name={c.icon}
                        size={13}
                        color={industry === c.label ? WZ.purple : WZ.ink3}
                      />
                      <Text style={[styles.chipText, industry === c.label && { color: WZ.purple, fontWeight: '700' }]}>
                        {c.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            {/* LINKS */}
            <Section
              accent={WZ.green} bg={WZ.greenLight}
              label="LINKS" summary={linkSummary}
              expanded={expanded === 'links'}
              onToggle={() => { toggle('links'); setActiveLink(null); }}
            >
              {/* Link type chips */}
              <View style={styles.chipRow}>
                {LINK_TYPES.map(t => {
                  const filled = !!linkValues[t.key];
                  const active = activeLink === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.chip,
                        filled && { borderColor: WZ.green, backgroundColor: `${WZ.green}18` },
                        active && { borderColor: WZ.green, backgroundColor: `${WZ.green}30` },
                      ]}
                      onPress={() => setActiveLink(active ? null : t.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, (filled || active) && { color: WZ.green, fontWeight: '700' }]}>
                        {filled ? '✓ ' : ''}{t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Active link input */}
              {activeLink && LINK_TYPES.find(t => t.key === activeLink) && (
                <View style={{ marginTop: 12 }}>
                  <TextInput
                    style={[styles.input, { borderColor: `${WZ.green}40`, marginBottom: 0 }]}
                    placeholder={LINK_TYPES.find(t => t.key === activeLink).placeholder}
                    placeholderTextColor={WZ.ink3}
                    value={linkValues[activeLink]}
                    onChangeText={v => handleLinkChange(activeLink, v)}
                    autoCapitalize="none"
                    keyboardType="url"
                    autoFocus
                  />
                </View>
              )}

              {/* Others section */}
              <View style={{ marginTop: 12 }}>
                {otherLinks.map((o, i) => (
                  <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <TextInput
                      style={[styles.input, { flex: 1, borderColor: `${WZ.green}40`, marginBottom: 0 }]}
                      placeholder={`Other link ${i + 1}`}
                      placeholderTextColor={WZ.ink3}
                      value={o.value}
                      onChangeText={v => updateOtherLink(o.id, v)}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                    <TouchableOpacity
                      onPress={() => removeOtherLink(o.id)}
                      style={{ marginLeft: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: `${WZ.coral}18`, alignItems: 'center', justifyContent: 'center' }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: '#FF6B6B', fontSize: 16, fontWeight: '700' }}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.chip, { borderColor: WZ.green, borderStyle: 'dashed', alignSelf: 'flex-start' }]}
                  onPress={addOtherLink}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: WZ.green }]}>+ Others</Text>
                </TouchableOpacity>
              </View>
            </Section>

          </View>

          <View style={{ height: 12 }} />
        </ScrollView>

        <View style={styles.bottomArea}>
          <View style={styles.footerPills}>
            <TouchableOpacity style={styles.footerPill}
              onPress={() => Linking.openURL('https://wezume.in/faq.html').catch(() => {})}>
              <MaterialIcons name="help-outline" size={13} color={WZ.ink3} />
              <Text style={styles.footerPillText}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerPill}
              onPress={() => Linking.openURL('https://wezume.in/privacypolicy.html').catch(() => {})}>
              <MaterialIcons name="security" size={13} color={WZ.ink3} />
              <Text style={styles.footerPillText}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerPill, styles.footerPillLogout]}
              onPress={() => Alert.alert('Logout', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: async () => {
                  await AsyncStorage.clear();
                  navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
                }},
              ])}>
              <MaterialIcons name="logout" size={13} color="#e74c3c" />
              <Text style={[styles.footerPillText, { color: '#e74c3c' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottom}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {saveState === 'saving' && <ActivityIndicator size="small" color={WZ.blue} style={{ marginRight: 6 }} />}
              {saveState === 'saved'  && <Text style={{ color: WZ.green, fontSize: 13, fontWeight: '700' }}>✓ </Text>}
              <Text style={{ color: WZ.ink3, fontSize: 12, fontWeight: '500' }}>
                {saveState === 'saving' ? 'Saving…' : 'Auto-saved'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleDone} activeOpacity={0.85}>
              <LinearGradient
                colors={['#FFC93A', '#FF9F43']}
                style={styles.cta}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>Looks good →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: WZ.bg },
  bottomArea:  { backgroundColor: WZ.card, borderTopWidth: 1, borderTopColor: WZ.line },
  footerPills: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 10, paddingHorizontal: 16 },
  footerPill:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: WZ.bg, borderWidth: 1, borderColor: WZ.line },
  footerPillLogout: { borderColor: '#fde8e8', backgroundColor: '#fff5f5' },
  footerPillText:   { fontSize: 12, color: WZ.ink3, fontWeight: '600' },
  hero:        { paddingTop: Platform.OS === 'ios' ? 8 : 12, paddingHorizontal: 20, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow:   { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  backBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  wordmark:    { height: 22, width: 80 },
  heroBody:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarArea:  { position: 'relative' },
  avatarInner: { position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderRadius: 999, overflow: 'hidden' },
  avatar:      { width: '100%', height: '100%' },
  avatarPlaceholder: { backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  avatarInitial:     { color: '#fff', fontSize: 24, fontWeight: '800' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  heroInfo:    { flex: 1 },
  heroName:    { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  completionPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  completionPillText: { color: WZ.yellow, fontSize: 11, fontWeight: '700' },
  card:        { backgroundColor: WZ.card, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1.5, borderColor: 'transparent' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  sectionDot:  { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4, flex: 1 },
  sectionSummary: { fontSize: 12, fontWeight: '600', maxWidth: '52%' },
  expandBody:  { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  fieldLabel:  { fontSize: 10, fontWeight: '800', color: WZ.ink3, letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1.5, borderColor: WZ.line, backgroundColor: WZ.card },
  chipText:    { fontSize: 12, fontWeight: '600', color: WZ.ink2 },
  input:       { height: 46, borderRadius: 12, borderWidth: 1.5, backgroundColor: WZ.card, paddingHorizontal: 14, fontSize: 14, color: WZ.ink, marginBottom: 10 },
  bottom:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 28 : 16 },
  cta:         { height: 46, paddingHorizontal: 22, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: WZ.yellow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 },
  ctaText:     { color: WZ.ink, fontSize: 14, fontWeight: '800' },
});

export default EditProfileScreen;
