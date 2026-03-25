import React, { useState, useEffect } from 'react';
import {
  Image,
  TextInput,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const { height: windowHeight } = Dimensions.get('window');

const SelectionModal = ({ visible, onClose, title, data, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredData = data.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                  setSearchQuery('');
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
                <Icon name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const Edit = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobOption, setJobOption] = useState('');

  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [experience, setExperience] = useState('');
  const [industry, setIndustry] = useState('');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [city, setCity] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [originalContactInfo, setOriginalContactInfo] = useState({ email: '', phoneNumber: '' });

  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showLinkTypeModal, setShowLinkTypeModal] = useState(false);
  const [links, setLinks] = useState([
    { type: 'LinkedIn', url: '' },
  ]);

  const [activeLinkIndex, setActiveLinkIndex] = useState(null);

  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [updating, setUpdating] = useState(false);
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 20 && showScrollIndicator) {
      setShowScrollIndicator(false);
    } else if (offsetY <= 20 && !showScrollIndicator) {
      setShowScrollIndicator(true);
    }
  };


  const experienceOptions = [
    { label: '0-1 years', value: '0-1' }, { label: '1-3 years', value: '1-3' },
    { label: '3-5 years', value: '3-5' }, { label: '5-10 years', value: '5-10' },
    { label: '10-15 years', value: '10-15' }, { label: '15+ years', value: '10+' },
  ];

  const cityOptions = [
    'NEW DELHI',
    'MUMBAI',
    'BENGALURU',
    'CHENNAI',
    'HYDERABAD',
    'PUNE',
    'KOLKATA',
    // Add more cities here
  ];

  const industries = [
    'IT/ITES',
    'MEDIA & ENTERTAINMENT',
    'HOSPITALITY',
    'TRANSPORT & AVIATION',
    'REAL ESTATE, INFRASTRUCTURE & CONSTRUCTION',
    'CONSUMER GOODS, RETAIL & E-COMMERS',
    'MANUFACTURING & LOGISTICS',
    'ENERGY, UTILITIES & PUBLIC SECTORS',
    'HEALTHCARE & LIFE SCIENCE',
    'PROFESSIONAL SERVICE',
    'STARTUPS',
    'EDUCATION & EDTECH',
    'BFIS (BANKING, FINANCIAL SERVICE & INSURANCE)',
    'OTHERS',
  ];

  const linkTypes = [
    'LinkedIn',
    'GitHub',
    'LeetCode',
    'Blog',
    'Portfolio',
  ];

  useEffect(() => {
    const loadDataFromStorage = async () => {
      try {
        const apiUserId = await AsyncStorage.getItem('userId');
        let storedProfileUrl = await AsyncStorage.getItem('profileUrl');
        if (!storedProfileUrl) {
          storedProfileUrl = await AsyncStorage.getItem('profilePic');
        }

        console.log("storedProfileUrl", storedProfileUrl);


        const parsedUserId = apiUserId ? parseInt(apiUserId, 10) : null;
        if (parsedUserId) {
          setUserId(parsedUserId);
          if (storedProfileUrl) {
            setProfilePicUrl(storedProfileUrl);
          }
          await getUserDetails(parsedUserId, storedProfileUrl);
        } else {
          setLoading(false);
          Alert.alert('Error', 'User not found. Please log in again.');
          navigation.navigate('LoginScreen');
        }
      } catch (error) {
        setLoading(false);
        console.error('Error loading user data from AsyncStorage', error);
      }
    };
    loadDataFromStorage();
  }, [navigation]);

  const getUserDetails = async (id, fallbackUrl = null) => {
    try {
      const response = await apiClient.get(`/api/users/get/${id}`);
      const userData = response.data;
      console.log('Fetched User Data:', userData);

      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
      setJobOption(userData.jobOption || '');

      // Use API profile pic if available, otherwise use fallback from storage
      if (userData.profilePic && userData.profilePic !== 'null' && userData.profilePic !== '') {
        setProfilePicUrl(userData.profilePic);
      } else if (fallbackUrl) {
        setProfilePicUrl(fallbackUrl);
      } else {
        setProfilePicUrl(null);
      }

      setCurrentRole(userData.currentRole || '');
      setKeySkills(userData.keySkills || '');
      setExperience(userData.experience || '');
      setCity(userData.city || '');
      setIndustry(userData.industry || '');

      try {
        // Check for 'links' first (matching backend), then fallback to 'socialLinks'
        const rawLinks = userData.links || userData.socialLinks;
        let parsedLinks = [];

        if (Array.isArray(rawLinks)) {
          parsedLinks = rawLinks;
        } else if (typeof rawLinks === 'string') {
          try {
            // Try parsing as JSON first
            const jsonLinks = JSON.parse(rawLinks);
            parsedLinks = Array.isArray(jsonLinks) ? jsonLinks : [];
          } catch (e) {
            // JSON parse failed, treat as CSV string "type:url,type:url"
            if (rawLinks.trim().length > 0) {
              const items = rawLinks.split(',');
              parsedLinks = items.map(item => {
                const firstColon = item.indexOf(':');
                if (firstColon > -1) {
                  return {
                    type: item.substring(0, firstColon).trim(),
                    url: item.substring(firstColon + 1).trim()
                  };
                }
                // Fallback for items without colon
                return { type: '', url: item.trim() };
              });
            }
          }
        }

        // Normalize links to objects { type, url }
        const normalizedLinks = parsedLinks.map(link => {
          if (typeof link === 'string') return { type: '', url: link };
          return link;
        });

        // Ensure we have at least one LinkedIn slot if empty, or just set it
        setLinks(normalizedLinks.length > 0 ? normalizedLinks : [{ type: 'LinkedIn', url: '' }]);

      } catch (e) {
        console.warn("Failed to parse links:", e);
        setLinks([{ type: 'LinkedIn', url: '' }]);
      }
      setCurrentEmployer(userData.currentEmployer || '');
      setOriginalContactInfo({ email: userData.email, phoneNumber: userData.phoneNumber });
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Could not load your profile data.');
    } finally {
      setLoading(false);
    }
  };

  const checkIfEmailExists = async (newEmail) => { /* Your logic here */ };
  const checkIfPhoneExists = async (newPhone) => { /* Your logic here */ };

  const handleProfilePic = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel || response.errorMessage) {
        console.error('ImagePicker error:', response.errorMessage);
        return;
      }
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `profile_pic_${userId}.jpg`,
        });
        setProfilePicUrl(asset.uri);
      }
    });
  };

  const handleUpdateProfile = async () => {
    // Validation for mandatory LinkedIn link
    if (links.length === 0 || !links[0].url || links[0].type !== 'LinkedIn') {
      Alert.alert('Validation Error', 'LinkedIn proof link is mandatory!');
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();

      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('jobOption', jobOption);
      formData.append('currentEmployer', currentEmployer);
      formData.append('currentRole', currentRole);
      formData.append('keySkills', keySkills);
      formData.append('experience', experience);
      formData.append('industry', industry);
      formData.append('city', city);

      // ✅ LINKS → SINGLE STRING
      const linksString = links
        .filter(link => link.type && link.url)
        .map(link => `${link.type.toLowerCase()}:${link.url.trim()}`)
        .slice(0, 5)
        .join(',');

      if (linksString.length > 0) {
        formData.append('links', linksString);
      }

      if (selectedImage) {
        formData.append('profilePic', selectedImage);
      }

      console.log('Sending links string:', linksString);

      await apiClient.put(
        `/api/users/update/${userId}`,
        formData
      );

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FastImage
      style={styles.backgroundImage}
      source={require('./assets/Background-01.jpg')}
      resizeMode={FastImage.resizeMode.cover}>
      <View style={styles.overlay}>
        <View style={styles.glassContainer}>
          <Text style={styles.title}>Update Profile</Text>

          <ScrollView
            style={styles.formArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
              <TouchableOpacity onPress={handleProfilePic} style={styles.avatarContainer}>
                <Image
                  source={profilePicUrl ? { uri: profilePicUrl } : require('./assets/headlogo.png')}
                  style={styles.avatar}
                />
                <View style={styles.cameraBadge}>
                  <Icon name="camera-plus" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.changePhotoText}>{selectedImage ? 'Image Selected' : 'Change Photo'}</Text>
            </View>

            {/* Form Inputs */}
            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Icon name="account-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  placeholderTextColor="#666"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="account-tie-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor="#666"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="email-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Icon name="phone-outline" size={20} color="#555" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#666"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: '#f5f5f5' }]}>
                <Icon name="briefcase-account" size={20} color="#777" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#777' }]}
                  placeholder="Job Role"
                  value={jobOption}
                  editable={false}
                />
              </View>

              {(jobOption === 'Employee' || jobOption === 'Entrepreneur' || jobOption === 'Freelancer') && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Professional Details</Text>



                  <View style={styles.inputWrapper}>
                    <Icon name="domain" size={20} color="#555" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Organization Name"
                      placeholderTextColor="#666"
                      value={currentEmployer}
                      onChangeText={setCurrentEmployer}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="briefcase-outline" size={20} color="#555" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Current Role"
                      placeholderTextColor="#666"
                      value={currentRole}
                      onChangeText={setCurrentRole}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Icon name="star-outline" size={20} color="#555" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Key Skills"
                      placeholderTextColor="#666"
                      value={keySkills}
                      onChangeText={setKeySkills}
                    />
                  </View>
                </>
              )}

              {/* {jobOption === 'Employee' && (
             // ✅ FIX: Removed the wrapping View from the Picker
             <Picker selectedValue={experience} onValueChange={setExperience} style={styles.picker}>
                <Picker.Item label="Select Experience" value="" />
                {experienceOptions.map(option => (<Picker.Item label={option.label.trim()} value={option.value} key={option.value} />))}
             </Picker>
          )} */}

              {/* Industry Selection */}
              {(jobOption === 'Employee' || jobOption === 'Employer' || jobOption === 'Entrepreneur') && (
                <View style={styles.inputWrapper}>
                  <Icon name="factory" size={20} color="#555" style={styles.inputIcon} />
                  <TouchableOpacity
                    style={styles.pickerTouchable}
                    onPress={() => setShowIndustryModal(true)}
                  >
                    <Text style={[styles.pickerText, !industry && { color: '#666' }]}>
                      {industry || "Select Industry"}
                    </Text>
                    <Icon name="chevron-down" size={20} color="#555" />
                  </TouchableOpacity>
                </View>
              )}

              {/* City Selection */}
              <View style={styles.inputWrapper}>
                <Icon name="city-variant-outline" size={20} color="#555" style={styles.inputIcon} />
                <TouchableOpacity
                  style={styles.pickerTouchable}
                  onPress={() => setShowCityModal(true)}
                >
                  <Text style={[styles.pickerText, !city && { color: '#666' }]}>
                    {city || "Select City"}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#555" />
                </TouchableOpacity>
              </View>

              {/* Social Links Section */}
              {/* Social Links Section - Only for Employee and Freelancer */}
              {(jobOption === 'Employee' || jobOption === 'Freelancer') && (
                <>
                  <View style={styles.sectionDivider} />
                  <Text style={styles.sectionLabel}>Proof</Text>

                  {links.map((link, index) => {
                    let iconName = 'link';
                    const typeLower = (link.type || '').toLowerCase();
                    if (typeLower.includes('linkedin')) iconName = 'linkedin';
                    else if (typeLower.includes('github')) iconName = 'github';
                    else if (typeLower.includes('leetcode')) iconName = 'code-braces';
                    else if (typeLower.includes('blog')) iconName = 'post-outline';
                    else if (typeLower.includes('portfolio')) iconName = 'web';

                    return (
                      <View key={index} style={styles.linkRow}>
                        <TouchableOpacity
                          style={styles.linkTypeSelector}
                          onPress={() => {
                            if (index > 0) {
                              setActiveLinkIndex(index);
                              setShowLinkTypeModal(true);
                            }
                          }}
                        >
                          <Icon name={iconName} size={20} color="#555" style={{ marginRight: 5 }} />
                          <Text style={styles.linkTypeText}>{link.type || 'Type'}</Text>
                          {index > 0 && <Icon name="chevron-down" size={16} color="#555" />}
                        </TouchableOpacity>
                        <TextInput
                          style={styles.linkInput}
                          placeholder="URL"
                          placeholderTextColor="#999"
                          value={link.url}
                          onChangeText={(text) => {
                            const newLinks = [...links];
                            newLinks[index].url = text;
                            setLinks(newLinks);
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {index > 0 && (
                          <TouchableOpacity onPress={() => {
                            const newLinks = links.filter((_, i) => i !== index);
                            setLinks(newLinks);
                          }}>
                            <Icon name="close-circle" size={20} color="#e74c3c" />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}

                  {links.length < 5 && (
                    <>
                      <Text style={[styles.sectionLabel, { marginTop: 10 }]}>Additional Proof</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ width: '100%' }}
                        contentContainerStyle={styles.pillContainer}
                      >
                        {['GitHub', 'LeetCode', 'Blog', 'Portfolio'].map((type) => {
                          const isAlreadyAdded = links.some(l => l.type === type);
                          return (
                            <TouchableOpacity
                              key={type}
                              style={[styles.pill, isAlreadyAdded && styles.pillDisabled]}
                              onPress={() => {
                                if (!isAlreadyAdded) {
                                  setLinks([...links, { type, url: '' }]);
                                }
                              }}
                              disabled={isAlreadyAdded}
                            >
                              <Icon
                                name={
                                  type === 'LeetCode' ? 'code-braces' :
                                    type === 'Blog' ? 'post-outline' :
                                      type === 'Portfolio' ? 'web' :
                                        type.toLowerCase()
                                }
                                size={14}
                                color={isAlreadyAdded ? '#bbb' : '#2e80d8'}
                                style={{ marginRight: 4 }}
                              />
                              <Text style={[styles.pillText, isAlreadyAdded && styles.pillTextDisabled]}>{type}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          {/* Modals */}
          <SelectionModal
            visible={showIndustryModal}
            onClose={() => setShowIndustryModal(false)}
            title="Select Industry"
            data={industries}
            onSelect={setIndustry}
          />
          <SelectionModal
            visible={showCityModal}
            onClose={() => setShowCityModal(false)}
            title="Select City"
            data={cityOptions}
            onSelect={setCity}
          />
          <SelectionModal
            visible={showLinkTypeModal}
            onClose={() => setShowLinkTypeModal(false)}
            title="Select Proof Type"
            data={linkTypes}
            onSelect={(type) => {
              if (activeLinkIndex !== null) {
                const newLinks = [...links];
                newLinks[activeLinkIndex].type = type;
                setLinks(newLinks);
              }
            }}
          />

          {showScrollIndicator && (
            <Animated.View
              style={[
                styles.scrollIndicator,
                { transform: [{ translateY: bounceAnim }] }
              ]}
              pointerEvents="none"
            >
              <Icon name="chevron-down" size={30} color="#2e80d8" />
            </Animated.View>
          )}

          <View style={styles.footer}>
            <LinearGradient colors={['#70bdff', '#2e80d8']} style={styles.btn}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.updateButtonText}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity
              onPress={() => {
                if (jobOption === 'Employee' || jobOption === 'Freelancer') {
                  navigation.navigate('home1');
                } else if (jobOption === 'Employer' || jobOption === 'Investor') {
                  navigation.navigate('RecruiterDash');
                } else {
                  // Default fallback
                  navigation.navigate('Account');
                }
              }}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </FastImage>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)', // Subtle overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContainer: {
    width: '93%',
    height: '65%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Glass effect
    borderRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2e80d8',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    marginTop: 10,
    color: '#2e80d8',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    marginBottom: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 10,
  },
  btn: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#70bdff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  updateButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#70bdff',
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#2e80d8',
    fontWeight: '700',
    fontSize: 16,
  },
  // ✅ FIX: Merged pickerWrapper styles into picker and removed pickerWrapper
  picker: {
    width: '100%',
    height: 50,
    color: 'black',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerInput: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  pickerTouchable: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 15,
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#444',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 120, // Adjust based on footer height
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 2,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingHorizontal: 10,
    height: 50,
  },
  linkTypeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    minWidth: 90,
    justifyContent: 'space-between',
  },
  linkTypeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 5,
  },
  linkInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%',
  },
  addLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#2e80d8',
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 10,
    backgroundColor: 'rgba(46, 128, 216, 0.05)',
  },
  addLinkText: {
    color: '#2e80d8',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 5,
    marginLeft: 0,
    paddingRight: 25, // Add padding to ensure the last pill isn't clipped
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2e80d8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pillDisabled: {
    borderColor: '#eee',
    backgroundColor: '#f9f9f9',
    elevation: 0,
    shadowOpacity: 0,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e80d8',
  },
  pillTextDisabled: {
    color: '#bbb',
  },
});

export default Edit;