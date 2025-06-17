import { Text, View, StyleSheet, Switch } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { TimeItemRightAction } from './TimeItemRightAction';
import { NotificationTimeProps } from '@/helpers/props.helper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  item: NotificationTimeProps;
  toggleSwitch: Function;
  removeCustomTime: Function;
  editCustomTime: Function;
}

export function TimeItem({ item, toggleSwitch, removeCustomTime, editCustomTime }: Props) {
  const timeItemRightActions = [
    {
      type: 'Delete',
      function: removeCustomTime,
    },
    {
      type: 'Edit',
      function: editCustomTime,
    },
  ];

  const translateX = useSharedValue(0);
  const SWIPE_THRESHOLD = -100;
  const ACTION_WIDTH = 240; // Width for both actions

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow left swipe (negative translation)
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -ACTION_WIDTH);
      }
    })
    .onEnd((event) => {
      if (event.translationX < SWIPE_THRESHOLD) {
        // Open actions
        translateX.value = withSpring(-ACTION_WIDTH);
      } else {
        // Close actions
        translateX.value = withSpring(0);
      }
    });


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const actionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < -20 ? 1 : 0,
      transform: [{ translateX: translateX.value + ACTION_WIDTH }],
    };
  });

  const closeActions = () => {
    translateX.value = withSpring(0);
  };

  const swipeableContent = (
    <View style={styles.timeItem} key={item.id}>
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

  if (!item.isCustom) {
    return swipeableContent;
  }

  return (
    <View style={styles.container}>
      {/* Action buttons positioned behind */}
      <Animated.View style={[styles.actionsContainer, actionsAnimatedStyle]}>
        {timeItemRightActions.map((action) => (
          <TimeItemRightAction
            key={action.type}
            actionType={action.type}
            id={item.id}
            onPressAction={() => {
              runOnJS(closeActions)();
              if (action.type === 'Delete') {
                removeCustomTime(item.id);
              } else {
                editCustomTime(item.id);
              }
            }}
          />
        ))}
      </Animated.View>

      {/* Main content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>{swipeableContent}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
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
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    width: 240,
  },
});
