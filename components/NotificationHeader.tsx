import { View, Text, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';

export function NotificationHeader({ flag }) {
  return (
    <View style={styles.header}>
      <Bell color="#000" />
      <Text style={styles.title}>Notification Times {flag}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
    paddingHorizontal: 20,
    zIndex: -1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#000000',
  },
});
