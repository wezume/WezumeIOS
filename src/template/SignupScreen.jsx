import React, { useState, useEffect } from 'react';
import {
  Image,
  TextInput,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import UploadImage from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';
import env from './env';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('window');

const SelectionModal = ({ visible, onClose, title, data, onSelect }) => {
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

          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
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
const SignupScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobOption, setJobOption] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null); // For profile pic
  const [currentRole, setCurrentRole] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [experience, setExperience] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [currentEmployer, setCurrentEmployer] = useState('');
  const [languages, setLanguages] = useState(['']);
  const navigation = useNavigation();
  const [base64Image, setBase64Image] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [industrySearchText, setIndustrySearchText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [city, setCity] = useState('');
  const [selectedRoleCode, setSelectedRoleCode] = useState(null);
  const [selectRole, setSelectRole] = useState('');
  const [iscollege, setisCollege] = useState([]);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const roleDisplayMap = {
    'Employer': 'Recruiters',
    'Freelancer': 'Freelancer',
    'Employee': 'Jobseeker',
    'Entrepreneur': 'Entrepreneur',
    'Investor': 'Investor'
  };

  const roleValueMap = {
    'Recruiters': 'Employer',
    'Freelancer': 'Freelancer',
    'Jobseeker': 'Employee',
    'Entrepreneur': 'Entrepreneur',
    'Investor': 'Investor'
  };

  const roleOptions = Object.keys(roleValueMap);
  const experienceOptions = [
    { label: '  0-1 years', value: '0-1' },
    { label: '  1-3 years', value: '1-3' },
    { label: '  3-5 years', value: '3-5' },
    { label: '  5-10 years', value: '5-10' },
    { label: '  10-15 years', value: '10-15' },
    { label: '  15+ years', value: '10+' },
  ];

  const fetchColleges = async (jobRole) => {
    console.log("Fetching colleges for job role:", jobRole);
    console.log(iscollege);


    try {
      setLoading(true);
      const response = await axios.get(`${env.baseURL}/api/auth/details/${jobRole}`);
      console.log("Response:", response.data); // This should show the expected data from the API

      // Update the state with the fetched college data
      setisCollege(response.data.colleges); // Assuming colleges is an array of objects
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.data);
        Alert.alert("Error", error.response.data.message || "Failed to fetch colleges.");
      } else {
        console.error("Network Error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Gesture handler for the tilt effect
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      rotateY.value = interpolate(
        event.translationX,
        [-width / 2, width / 2],
        [-10, 10] // Tilt range in degrees
      );
      rotateX.value = interpolate(
        event.translationY,
        [-height / 2, height / 2],
        [10, -10] // Tilt range in degrees
      );
    })
    .onEnd(() => {
      // Reset rotation smoothly when gesture ends
      rotateX.value = withTiming(0, { duration: 500 });
      rotateY.value = withTiming(0, { duration: 500 });
    });

  // Animated style for the container
  const animatedStyle = useAnimatedStyle(() => {
    const rotateXvalue = `${rotateX.value}deg`;
    const rotateYvalue = `${rotateY.value}deg`;
    return {
      transform: [
        { perspective: 300 },
        { rotateX: rotateXvalue },
        { rotateY: rotateYvalue },
      ],
    };
  });
  // --- End of Animation Setup ---


  console.log(selectedRoleCode);
  console.log(selectedCollege);

  // Trigger the fetchColleges function when selectRole changes
  useEffect(() => {
    if (selectRole === 'placementDrive' || selectRole === 'Academy') {
      fetchColleges(selectRole);
    }
  }, [selectRole]);

  const filteredColleges = iscollege.filter(college =>
    college.college.toLowerCase().includes(searchText.toLowerCase()) // Access the 'college' field
  );

  const cityOptions = [
    'New Delhi',
    'Mumbai',
    'Bengaluru ',
    'Chennai ',
    'Hyderabad ',
    'Pune ',
    'Kolkata ',
    // Add more cities here
  ];
  const industries = [
    'Banking & Finance',
    'Biotechnology',
    'Construction',
    'Consumer Goods',
    'Education',
    'Energy',
    'Healthcare',
    'Media & Entertainment',
    'Hospitality',
    'Information Technology (IT)',
    'Insurance',
    'Manufacturing',
    'Non-Profit',
    'Real Estate',
    'Retail',
    'Transportation',
    'Travel & Tourism',
    'Textiles',
    'Logistics & Supply Chain',
    'Sports',
    'E-commerce',
    'Consulting',
    'Advertising & Marketing',
    'Architecture',
    'Arts & Design',
    'Environmental Services',
    'Human Resources',
    'Legal',
    'Management',
    'Telecommunications',
    // Add more industries as needed
  ];



  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(100), (val, index) => currentYear - index);
  const addLanguageField = () => {
    if (languages.length < 3) {
      setLanguages([...languages, '']);
    }
  };
  const filteredIndustries = industries.filter(industry =>
    industry.toLowerCase().includes(industrySearchText.toLowerCase()),
  );
  const toggleIndustryDropdown = () =>
    setIsIndustryDropdownOpen(!isIndustryDropdownOpen);
  const selectIndustry = selectedIndustry => {
    setIndustry(selectedIndustry);
    setIsIndustryDropdownOpen(false);
  };
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectCity = cityName => {
    setCity(cityName);
    setIsDropdownOpen(false); // Close dropdown after selection
    setSearchText(''); // Clear search text
  };

  const filteredCities = cityOptions.filter(cityName =>
    cityName.toLowerCase().includes(searchText.toLowerCase()),
  );
  const validateInputs = () => {
    if (
      !firstName ||
      !email ||
      !phoneNumber ||
      !jobOption ||
      !password
    ) {
      Alert.alert('Validation Error', 'All fields are required!');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Invalid email format!');
      return false;
    }


    if (phoneNumber.length !== 10) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid 10-digit phone number!',
      );
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateInputs()) {
      return;
    }

    // Check if email is already taken
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      Alert.alert('Validation Error', 'Email is already registered!');
      return;
    }

    // Check for public domain email if jobOption is "employer"
    if (jobOption === 'Employer') {
      const isPublicEmail = await checkIfPublicEmail(email);
      if (isPublicEmail) {
        Alert.alert(
          'Validation Error',
          'Employers must use a company email, not a public domain email!',
        );
        return;
      }
    }

    // Check if phone number is already taken
    const phoneExists = await checkIfPhoneExists(phoneNumber);
    if (phoneExists) {
      Alert.alert('Validation Error', 'Phone number is already registered!');
      return;
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('email', email);
    formData.append('phoneNumber', phoneNumber);
    formData.append('jobOption', jobOption);
    formData.append('password', password);
    formData.append('currentRole', currentRole);
    formData.append('keySkills', keySkills);
    formData.append('experience', experience);
    formData.append('industry', industry);
    formData.append('city', city);
    formData.append('currentEmployer', currentEmployer);
    formData.append('college', selectedCollege);
    formData.append('jobId', selectedRoleCode);

    setLoading(true);

    try {
      const response = await axios.post(
        `${env.baseURL}/api/users/signup/user`,
        formData,
        {
          headers: {
          },
        }
      );

      Alert.alert(
        'Success',
        'Registration successful! Please check your email for verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('LoginScreen');
              setFirstName('');
              setEmail('');
              setPhoneNumber('');
              setJobOption('');
              setPassword('');
              setProfilePic(null);
              setCurrentRole('');
              setKeySkills('');
              setExperience('');
              setCity('');
              setIndustry('');
              setCurrentEmployer('');
              setisCollege('');
            },
          },
        ],
      );
    } catch (error) {
      console.error(
        'Signup failed:',
        error.response ? error.response.data : error.message,
      );
      Alert.alert(
        'Signup failed',
        error.response ? error.response.data.message : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const checkIfEmailExists = async (email) => {
    try {
      const response = await axios.post(
        `${env.baseURL}/users/check-email`,
        { email }, // Wrapping email in an object
        { headers: { 'Content-Type': 'application/json' } },
      );
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkIfPublicEmail = async () => {
    try {
      const response = await axios.post(
        `${env.baseURL}/users/check-Recruteremail`,
        { email },
        { headers: { 'Content-Type': 'application/json' } },
      );
      if (response.data.error === 'Public email domains are not allowed') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking public email:', error);
      return false;
    }
  };

  const checkIfPhoneExists = async (phoneNumber) => {
    try {
      const response = await axios.post(
        `${env.baseURL}/users/check-phone`,
        phoneNumber,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error checking phone number:', error);
      return false;
    }
  };

  const handleProfilePic = async () => {
    launchImageLibrary({ mediaType: 'photo' }, async response => {
      if (response.didCancel) {
        setIsImageUploaded(false); // Reset if canceled
      } else if (response.errorMessage) {
        console.error('ImagePicker error: ', response.errorMessage);
        setIsImageUploaded(false); // Reset on error
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        try {
          const base64String = await RNFS.readFile(imageUri, 'base64');
          const cleanBase64String = base64String.replace(
            /^data:image\/\w+;base64,/,
            '',
          );
          setBase64Image(cleanBase64String);
          setIsImageUploaded(true);
          setProfilePic(imageUri); // Update profilePic state for display
        } catch (error) {
          console.error('Error converting image to Base64: ', error);
          setIsImageUploaded(false); // Reset on error
        }
      }
    });
  };

  return (
    <FastImage
      style={styles.backgroundImage}
      source={require('./assets/Background-01.jpg')}
      resizeMode={FastImage.resizeMode.cover}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.glassContainer, animatedStyle]}>
            <BlurView
              style={styles.absolute}
              blurType="xlight"
              blurAmount={8}
              reducedTransparencyFallbackColor="white"
            />
            <Image style={styles.img2} source={require('./assets/logopng.png')} />
            <Text style={styles.title}>SignUp</Text>
            <View
              style={{ width: '100%' }}>
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor="#000"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#000"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#000"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              <View style={styles.inputWrapper}>
                <TouchableOpacity
                  style={styles.pickerTouchable}
                  onPress={() => setShowRoleModal(true)}
                >
                  <Text style={[styles.pickerText, !jobOption && { color: '#000' }]}>
                    {jobOption ? roleDisplayMap[jobOption] : "Scroll to select your role"}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#000" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#000"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#0077B5"
                style={styles.loadingIndicator}
              />
            ) : (
              <LinearGradient colors={['#70bdff', '#2e80d8']} style={styles.btn}>
                <TouchableOpacity
                  style={styles.signupButton}
                  onPress={handleSignup}>
                  <Text style={styles.signupButtonText}>SignUp</Text>
                </TouchableOpacity>
              </LinearGradient>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
              <Text style={styles.logAccount}>
                Already have an account? <Text style={{ color: 'blue' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
        <SelectionModal
          visible={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title="Select Role"
          data={roleOptions}
          onSelect={(role) => setJobOption(roleValueMap[role])}
        />
      </GestureHandlerRootView>
    </FastImage>
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  // The 'glassContainer' style from the previous implementation
  // is now correctly matched to the overall aesthetic.
  glassContainer: {
    width: '95%',
    height: '60%',
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 20,
    overflow: 'hidden',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: '40%',
    alignSelf: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  img2: {
    width: 180, // Slightly wider for better visibility
    height: 90, // Adjusted height
    alignSelf: 'center',
    marginBottom: 10, // More spacing
    marginTop: -20, // Adjusted to fit within the glass container
  },
  title: {
    fontSize: 26, // Slightly larger for prominence
    fontWeight: '700', // Bolder
    textAlign: 'center',
    color: '#333', // Darker for better contrast on light blur
    marginBottom: '5%', // Increased spacing
    marginTop: '-10%',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // More opaque for better text visibility
    borderWidth: 0.3,
    borderColor: '#0387e0',
    padding: 14, // Increased padding
    marginBottom: 15, // Consistent spacing
    borderRadius: 12, // More rounded corners
    color: '#333', // Darker text
    fontSize: 16,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.3,
    borderColor: '#0387e0',
    marginBottom: 15,
    borderRadius: 12, // This must match your input's borderRadius
    overflow: 'hidden', // This is the crucial property that hides the overflowing content
  },

  picker: {
    color: '#333',
    height: 50,
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#0077B5', // Original color
    padding: 14, // Consistent padding
    borderRadius: 12, // Consistent rounded corners
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButtonSuccess: {
    backgroundColor: '#28a745', // Green for success
  },
  uploadButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10, // Space between text and icon
  },
  loadingIndicator: {
    paddingVertical: 15,
    marginVertical: 10,
  },
  btn: {
    width: '70%', // Wider button
    alignSelf: 'center', // Center the button
    borderRadius: 12, // Consistent rounded corners
    elevation: 8, // Stronger shadow
    marginTop: 10, // More space above
    marginBottom: 5,
  },
  signupButton: {
    paddingVertical: 14, // Consistent padding
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 18,
  },
  logAccount: {
    marginTop: 10, // More space above
    textAlign: 'center',
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  // Dropdown styles (retained and slightly adjusted for consistency)
  dropdownButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Align icon vertically
    borderColor: '#0387e0',
    borderWidth: 0.3,
  },
  dropdownButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    maxHeight: 180,
    marginTop: -5,
    marginBottom: 10,
    elevation: 3,
  },
  searchInput: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 0.3,
    borderColor: '#0387e0',
    marginBottom: 15,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
  },
  pickerTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#888',
    padding: 15,
    fontSize: 15,
  },
});

export default SignupScreen;
