import { StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface Props {
  actionType: string;
  id: Number;
  progress: any;
  dragX: object;
  onPressAction: Function;
}

export function TimeItemRightAction({ actionType, id, progress, dragX, onPressAction }: Props) {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      style={{
        ...styles.action,
        backgroundColor: actionType === 'Delete' ? '#FF3B30' : '#007AFF',
      }}
      onPress={() => onPressAction(id)}
      key={actionType}
    >
      <Animated.Text style={[styles.actionText, { transform: [{ scale }] }]}>
        {actionType}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  action: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    height: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
