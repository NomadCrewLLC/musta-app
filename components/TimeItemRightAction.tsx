import { StyleSheet, TouchableOpacity, Animated } from "react-native";

interface Props {
  id: string,
  progress: any,
  dragX: object,
  removeCustomTime: Function
}

export function TimeItemRightAction({ id, progress, dragX, removeCustomTime }: Props) {
  const scale = dragX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => removeCustomTime(id)}
    >
      <Animated.Text
        style={[
          styles.deleteActionText,
          { transform: [{ scale }] }
        ]}
      >
        Delete
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 30,
    height: "100%",
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
