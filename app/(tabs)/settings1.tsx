import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Bell, Plus, X } from "lucide-react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TimeItem } from "@/components/TimeItem";
import { formatTime } from "@/helpers/datetime.helper";
import { SelectedItemProps } from "@/helpers/props.helper";

const NotificationSettings = () => {
  const [notificationTimes, setNotificationTimes] = useState([
    { id: 1, time: "8:00 AM", isEnabled: true },
    { id: 2, time: "8:00 PM", isEnabled: true },
  ]);
  const [customTimes, setCustomTimes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  function toggleSwitch(id) {
    const updatedTimes = [...notificationTimes, ...customTimes].map((item) =>
      item.id === id ? { ...item, isEnabled: !item.isEnabled } : item
    );

    const defaultTimes = updatedTimes.filter((time) =>
      notificationTimes.some((defaultTime) => defaultTime.id === time.id)
    );
    const custom = updatedTimes.filter((time) =>
      customTimes.some((customTime) => customTime.id === time.id)
    );

    setNotificationTimes(defaultTimes);
    setCustomTimes(custom);
  }

  function addCustomTime(selectedDate) {
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  }

  function confirmTime() {
    if (selectedTime) {
      const newTime = {
        id: Date.now(),
        time: formatTime(selectedTime),
        isEnabled: true,
      };
      setCustomTimes([...customTimes, newTime]);
    }
    setShowModal(false);
  }

  function removeCustomTime(id) {
    setCustomTimes(customTimes.filter((time) => time.id !== id));
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text>🔔</Text>
        <Text style={styles.title}>Notification Times</Text>
      </View>

      <View style={styles.timesList}>
        {notificationTimes.map((time: SelectedItemProps) => (
          <TimeItem
            key={time.id}
            item={time}
            isCustom={false}
            toggleSwitch={toggleSwitch}
            removeCustomTime={removeCustomTime}
          />
        ))}

        {customTimes.map((time) => (
          <TimeItem
            key={time.id}
            item={time}
            isCustom={true}
            toggleSwitch={toggleSwitch}
            removeCustomTime={removeCustomTime}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowModal(true)}
      >
        <Text>➕</Text>
        <Text style={styles.addButtonText}>Add Time</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Text>❌</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => addCustomTime(date)}
              style={styles.timePicker}
              minuteInterval={30}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => confirmTime(selectedTime)}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Text style={styles.description}>
        You'll receive notifications at these times every day to help you stay
        on track.
      </Text>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#000000",
  },
  timesList: {
    marginBottom: 20,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 5,
  },
  timePicker: {
    height: 200,
    backgroundColor: "red",
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NotificationSettings;
