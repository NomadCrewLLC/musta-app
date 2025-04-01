import { View, Text, StyleSheet } from 'react-native';

export function NotificationButtonDescription({ isLimitReached }: { isLimitReached: boolean }) {
  if (!isLimitReached) {
    return (
      <Text style={styles.description}>
        Receive daily notifications at these times to keep you on track.
      </Text>
    );
  } else {
    return (
      <View>
        <Text style={styles.description}>You've reached the notification limit.</Text>
        <Text style={styles.description}>
          No more scheduled notifications can be created until you remove or disable some existing
          ones.
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
