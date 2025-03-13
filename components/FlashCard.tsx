import { Text, View, StyleSheet } from 'react-native';

type FlashCardProps = {
  title: string;
  subtitle: string;
};

export function FlashCard({ title, subtitle }: FlashCardProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'antiquewhite',
    height: 150,
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
  },
  title: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 24,
  },
});
