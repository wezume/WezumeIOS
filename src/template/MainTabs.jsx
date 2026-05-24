import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './HomeScreen';
import DiscoverScreen from './DiscoverScreen';
import EditProfileScreen from './EditProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ACTIVE   = '#1E9BD7';
const TAB_INACTIVE = '#8B97A8';
const TAB_BG       = '#FFFFFF';

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: TAB_ACTIVE,
      tabBarInactiveTintColor: TAB_INACTIVE,
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ color, focused }) => {
        const icons = {
          Home:     focused ? 'home'           : 'home',
          Discover: focused ? 'explore'        : 'explore',
          Me:       focused ? 'person'         : 'person-outline',
        };
        return (
          <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
            <MaterialIcons name={icons[route.name]} size={24} color={color} />
          </View>
        );
      },
    })}>
    <Tab.Screen name="Home"     component={HomeScreen} />
    <Tab.Screen name="Discover" component={DiscoverScreen} />
    <Tab.Screen name="Me"       component={EditProfileScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_BG,
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 84 : 62,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconWrapActive: {
    backgroundColor: '#E6F5FB',
  },
});

export default MainTabs;
