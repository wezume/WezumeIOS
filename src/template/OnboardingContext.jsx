import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnboardingContext = createContext(null);

const STORAGE_KEY = 'wz_onboarding_state';

export const OnboardingProvider = ({ children }) => {
  const [state, setState] = useState({
    step: 'welcome',   // 'welcome' | 'role' | 'details' | 'done'
    role: null,        // 'jobseeker' | 'freelancer' | 'entrepreneur' | 'recruiter' | 'investor'
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  // Load persisted state on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setState(JSON.parse(raw)); } catch (_) {}
      }
    });
  }, []);

  const update = (patch) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const clear = () => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState({ step: 'welcome', role: null, name: '', email: '', phone: '', password: '' });
  };

  return (
    <OnboardingContext.Provider value={{ state, update, clear }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
