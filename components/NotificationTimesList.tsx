import { View, StyleSheet } from 'react-native';
import { TimeItem } from './TimeItem';
import { NotificationTimeProps } from '@/helpers/props.helper';

interface NotificationTimesListProps {
  notificationTimes: NotificationTimeProps[];
  toggleSwitch: (id: number) => Promise<void>;
  removeCustomTime: (id: number) => Promise<void>;
  editCustomTime: (id: number) => Promise<void>;
}

export function NotificationTimesList({
  notificationTimes,
  toggleSwitch,
  removeCustomTime,
  editCustomTime,
}: NotificationTimesListProps) {
  return (
    <View style={styles.timesList}>
      {notificationTimes.length > 0 &&
        notificationTimes.map((time) => (
          <TimeItem
            item={time}
            key={time.id}
            toggleSwitch={toggleSwitch}
            removeCustomTime={removeCustomTime}
            editCustomTime={editCustomTime}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timesList: {
    marginBottom: 20,
  },
});
