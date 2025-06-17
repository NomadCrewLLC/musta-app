import { StyleSheet, TouchableOpacity, Text } from 'react-native';

interface Props {
  actionType: string;
  id: Number;
  onPressAction: Function;
}

export function TimeItemRightAction({ actionType, id, onPressAction }: Props) {

  return (
    <TouchableOpacity
      style={{
        ...styles.action,
        backgroundColor: actionType === 'Delete' ? '#FF3B30' : '#007AFF',
      }}
      onPress={() => onPressAction(id)}
      key={actionType}
    >
      <Text style={styles.actionText}>{actionType}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    height: '100%',
    minWidth: 120,
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
