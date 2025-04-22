// HomeScreen.tsx
import React, { useRef, useCallback } from 'react';
import {
  SafeAreaView,
  VirtualizedList,
  StyleSheet,
  Text,
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FlashCard } from '@/components/FlashCard';
import { useLanguage } from '@/components/LanguageContext';

type Phrase = {
  id: string;
  phrase: string;
  translation: string;
};

export default function HomeScreen() {
  const { currentLanguage, loading, error, refreshLanguage } = useLanguage();
  // Use a ref to prevent multiple refreshes
  const hasRefreshedRef = useRef(false);

  // Refresh language data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!hasRefreshedRef.current) {
        refreshLanguage();
        hasRefreshedRef.current = true;
      }

      return () => {
        // Reset the flag when component loses focus
        hasRefreshedRef.current = false;
      };
    }, []) // Remove refreshLanguage from dependencies to prevent loops
  );

  // Create a getter for VirtualizedList
  const getPhrase = (_data: any, index: number): Phrase => {
    return {
      id: index.toString(),
      phrase: currentLanguage?.phrases[index]?.phrase || '',
      translation: currentLanguage?.phrases[index]?.translation || '',
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

  // No language/phrases available
  if (!currentLanguage || !currentLanguage.phrases || currentLanguage.phrases.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>No phrases available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerFlag}>{currentLanguage.flag}</Text>
        <Text style={styles.headerTitle}>{currentLanguage.name}</Text>
      </View>

      <Text style={styles.subheader}>
        Learn this language or forever be trapped in tourist restaurants with pictures on the menu.
      </Text>

      <VirtualizedList
        data={currentLanguage.phrases}
        initialNumToRender={4}
        renderItem={({ item }: { item: Phrase }) => (
          <FlashCard title={item.phrase} subtitle={item.translation} />
        )}
        keyExtractor={(item: Phrase) => item.id}
        getItemCount={() => currentLanguage.phrases.length}
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
