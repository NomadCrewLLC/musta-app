import React from 'react';
import { SafeAreaView, VirtualizedList, StyleSheet, Text, StatusBar } from 'react-native';
import data from '@/app/data/phrases.json';
import { FlashCard } from '@/components/FlashCard';

const phrases = data.phrases;

type PhraseData = {
  phrases: [{ phrase: string; translation: string }];
};

const getPhrase = (data: PhraseData, index: number) => ({
  id: Math.random().toString(12).substring(0),
  phrase: phrases[index].phrase,
  translation: phrases[index].translation,
});

const getPhraseCount = () => data.phrases.length;
const item = data.phrases;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text>Let’s make your brain a dictionary—one word at a time.</Text>
      <VirtualizedList
        initialNumToRender={4}
        renderItem={({ item }) => <FlashCard title={item.phrase} subtitle={item.translation} />}
        keyExtractor={(item) => item.id}
        getItemCount={getPhraseCount}
        getItem={getPhrase}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
  },
  item: {
    backgroundColor: '#fff5cc',
    height: 150,
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
  },
  title: {
    fontSize: 32,
  },
});
