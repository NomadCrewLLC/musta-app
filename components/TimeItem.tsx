import {
  Text,
  View,
  StyleSheet,
  Switch,
} from "react-native";
import { Swipeable } from 'react-native-gesture-handler';
import { TimeItemRightAction } from "./TimeItemRightAction";
import { SelectedItemProps } from "@/helpers/props.helper";

interface Props {
  item: SelectedItemProps,
  isCustom: boolean,
  toggleSwitch: Function,
  removeCustomTime: Function
}

export function TimeItem({ item, isCustom, toggleSwitch, removeCustomTime }: Props) {
  const swipeableContent = (
    <View style={styles.timeItem}>
      <Text style={styles.timeText}>{item.time}</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={item.isEnabled ? '#007AFF' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => toggleSwitch(item.id)}
        value={item.isEnabled}
      />
      
    </View>
  );

  if (!isCustom) {
    return swipeableContent;
  }

  return (
    <Swipeable
      renderRightActions={(progress, dragX) => {
        return <TimeItemRightAction id={item.id} progress={progress} dragX={dragX} removeCustomTime={removeCustomTime} />}}
    >
      {swipeableContent}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeText: {
    fontSize: 18,
    color: '#000000',
  },
});
