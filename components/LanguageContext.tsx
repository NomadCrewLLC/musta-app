import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import data from '@/app/data/languageData.json';

type Language = {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  phrases: Array<{
    phrase: string;
    translation: string;
  }>;
};

type LanguageContextType = {
  currentLanguage: Language | null;
  loading: boolean;
  error: string | null;
  setLanguage: (languageId: string) => Promise<void>;
  refreshLanguage: () => Promise<void>;
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load language on initial mount
  useEffect(() => {
    loadStoredLanguage();
  }, []);

  // Function to load language from AsyncStorage
  const loadStoredLanguage = async () => {
    try {
      setLoading(true);
      const storedLanguage = await AsyncStorage.getItem('language');

      // Parse the language ID
      let languageId: string | null = null;
      try {
        languageId = storedLanguage ? JSON.parse(storedLanguage) : null;
      } catch (e) {
        languageId = storedLanguage; // Use as-is if parsing fails
      }

      // Find language in data
      if (data.languages) {
        const filteredLanguage = data.languages.find((language) => language.id === languageId);

        if (filteredLanguage) {
          setCurrentLanguage(filteredLanguage);
          setError(null);
        } else {
          setError('No languages available');
          setCurrentLanguage(null);
        }
      } else {
        setError('No language data available');
        setCurrentLanguage(null);
      }
    } catch (error) {
      console.error('Error loading language:', error);
      setError('Failed to load language data');
      setCurrentLanguage(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to set a new language
  const setLanguage = async (languageId: string) => {
    try {
      setLoading(true);

      // Store in AsyncStorage
      await AsyncStorage.setItem('language', JSON.stringify(languageId));

      // Update current language
      await loadStoredLanguage();
    } catch (error) {
      console.error('Error setting language:', error);
      setError('Failed to set language');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh language (useful for screen focus)
  const refreshLanguage = async () => {
    return loadStoredLanguage();
  };

  // Context value
  const value = {
    currentLanguage,
    loading,
    error,
    setLanguage,
    refreshLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Custom hook for using the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
