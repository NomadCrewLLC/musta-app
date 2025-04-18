import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import languages from '@/app/data/languages.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import data from '@/app/data/phrase.json';

const languageSelection = languages.selection;

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  console.log('selectedLanguage', selectedLanguage);

  // Add orientation change listener
  useEffect(() => {
    const onChange = ({ window }) => {
      setDimensions(window);
    };

    Dimensions.addEventListener('change', onChange);

    return () => {
      // Clean up event listener
      if (Platform.OS === 'android') {
        // For older React Native versions
        Dimensions.removeEventListener('change', onChange);
      }
    };
  }, []);

  useEffect(() => {
    console.log('storedLanguageId is changed');
    getLanguage();
  }, [selectedLanguage]);

  async function getLanguage() {
    try {
      setIsLoading(true);

      // Get the stored language ID
      const storedLanguage = await AsyncStorage.getItem('language');
      console.log('storedLanguage getLanguage', storedLanguage);

      // Find the language in our data
      if (data.languages) {
        const filteredLanguage = data.languages.find(
          (language) => language.id === (storedLanguage ? JSON.parse(storedLanguage) : null)
        );
        console.log('filteredLanguage', filteredLanguage);
      } else {
        setError('No language data available');
      }
    } catch (error) {
      console.error('Error fetching language data:', error);
      setError('Failed to load language data');
    } finally {
      setIsLoading(false);
    }
  }

  // Determine if we should show in grid based on width
  const isTablet = dimensions.width >= 600;

  async function handleLanguageSelect(language) {
    console.log('language', language);
    setSelectedLanguage(language);
    await AsyncStorage.setItem('language', JSON.stringify(language));
    // Here you would typically save the language preference
    const myLanguage = await AsyncStorage.getItem('language');
    console.log('myLanguage', myLanguage);
  }

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.languageItem, selectedLanguage === item.id && styles.selectedLanguageItem]}
      onPress={() => handleLanguageSelect(item.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text
        style={[styles.languageName, selectedLanguage === item.id && styles.selectedLanguageName]}
      >
        {item.name}
      </Text>
      {selectedLanguage === item.id && (
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const handleContinue = () => {
    // Handle navigation to next screen
    // console.log(`Continuing with ${selectedLanguage.name}`);
    router.push('../(tabs)/settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Language</Text>
        <Text style={styles.headerSubtitle}>Select the language you prefer</Text>
      </View>

      {/* Language List */}
      <FlatList
        data={languageSelection}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        key={isTablet ? 'grid' : 'list'}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? styles.gridRow : undefined}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {selectedLanguage && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue with {selectedLanguage.name}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#757575',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Extra space at bottom to avoid button overlap
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  selectedLanguageItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  languageFlag: {
    fontSize: 26,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
  },
  selectedLanguageName: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  toggleButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
