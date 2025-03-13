import {
  Text,
  View,
  StyleSheet,
  Modal,
  Platform,
  TouchableOpacity,
  NativeSyntheticEvent,
} from 'react-native';
import { X as CloseButton } from 'lucide-react-native';
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type AddEditTimeModalProps = {
  title: string;
  value: string | Date;
  visible: boolean;
  onRequestClose: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  onClose: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  onConfirm: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  onChangeTime: (event: DateTimePickerEvent, date?: Date) => void;
};

export function AddEditTimeModal({
  title,
  value,
  visible,
  onRequestClose,
  onClose,
  onChangeTime,
  onConfirm,
}: AddEditTimeModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CloseButton />
            </TouchableOpacity>
          </View>
          <View style={styles.timePickerContainer}>
            <RNDateTimePicker
              value={value}
              textColor="#000"
              mode="time"
              display="spinner"
              onChange={onChangeTime}
              style={styles.timePicker}
              minuteInterval={10}
            />
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  timePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timePicker: {
    height: 200,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
