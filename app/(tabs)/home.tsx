import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  VirtualizedList,
  StyleSheet,
  Text,
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';
import data from '@/app/data/phrase.json';
import { FlashCard } from '@/components/FlashCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Phrase = {
  id: string;
  phrase: string;
  translation: string;
};

export default function HomeScreen() {
  const [phrases, setPhrases] = useState<Array<{ phrase: string; translation: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguageInfo, setSelectedLanguageInfo] = useState<{
    id: string;
    name: string;
    flag: string;
  } | null>(null);

const [storedLanguageId, setStoredLanguageId] = useState<string | null>(null);
console.log('storedLanguageId first load', storedLanguageId);

// Add this effect to check for language changes
useEffect(() => {
  const checkStoredLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem('language');
    console.log('storedLanguage', storedLanguage);
    setStoredLanguageId(storedLanguage);
  };

  checkStoredLanguage();

  // Optional: Set up an interval to periodically check for changes
  const interval = setInterval(checkStoredLanguage, 1000);
  return () => clearInterval(interval);
}, []);

// Modify the existing effect to depend on storedLanguageId
useEffect(() => {
  console.log('storedLanguageId is changed');
  getLanguage();
}, [storedLanguageId]);

  async function getLanguage() {
    try {
      setLoading(true);

      // Get the stored language ID
      const storedLanguage = await AsyncStorage.getItem('language');
      console.log('storedLanguage getLanguage', storedLanguage);

      // Find the language in our data
      if (data.languages) {
        const filteredLanguage = data.languages.find(
          (language) => language.id === (storedLanguage ? JSON.parse(storedLanguage) : null)
        );

        if (filteredLanguage) {
          setPhrases(filteredLanguage.phrases);
          setSelectedLanguageInfo({
            id: filteredLanguage.id,
            name: filteredLanguage.name,
            flag: filteredLanguage.flag,
          });
        } else {
          setError(
            `Language with ID "${storedLanguage ? JSON.parse(storedLanguage) : 'null'}" not found in data`
          );
        }
      } else {
        setError('No language data available');
      }
    } catch (error) {
      console.error('Error fetching language data:', error);
      setError('Failed to load language data');
    } finally {
      setLoading(false);
    }
  }

  // Create a proper item getter for VirtualizedList
  const getPhrase = (_data: any, index: number): Phrase => {
    return {
      id: index.toString(), // Simpler and more reliable ID
      phrase: phrases[index]?.phrase || '',
      translation: phrases[index]?.translation || '',
    };
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading phrases...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  // No phrases state
  if (!phrases || phrases.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>No phrases available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {selectedLanguageInfo && (
        <View style={styles.header}>
          <Text style={styles.headerFlag}>{selectedLanguageInfo.flag}</Text>
          <Text style={styles.headerTitle}>{selectedLanguageInfo.name}</Text>
        </View>
      )}

      <Text style={styles.subheader}>
        Learn this language or forever be trapped in tourist restaurants with pictures on the menu.
      </Text>

      <VirtualizedList
        data={phrases}
        initialNumToRender={4}
        renderItem={({ item }: { item: Phrase }) => (
          <FlashCard title={item.phrase} subtitle={item.translation} />
        )}
        keyExtractor={(item: Phrase) => item.id}
        getItemCount={() => phrases.length}
        getItem={getPhrase}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerFlag: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  subheader: {
    fontSize: 24,
    color: '#6c757d',
    textAlign: 'center',
    margin: 16,
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
});
