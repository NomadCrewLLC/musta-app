import { Plus } from 'lucide-react-native';
import { Text, NativeSyntheticEvent, TouchableOpacity, StyleSheet } from 'react-native';

type AddTimeButtonProps = {
  onPress: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  isDisabled: boolean;
};

export function AddTimeButton({ onPress, isDisabled }: AddTimeButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.addButton, isDisabled && styles.disabledButton]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Plus color={isDisabled ? '#999' : '#FFF'} />
      <Text style={[styles.addButtonText, isDisabled && styles.disabledButtonText]}>
        {isDisabled ? 'Notification Limit Reached' : 'Add Time'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#999999',
  },
});
