import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Bell, Plus, X } from "lucide-react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TimeItem } from "@/components/TimeItem";
import { formatTime } from "@/helpers/datetime.helper";
import {
  schedulePushNotification,
  cancelScheduledNotification,
} from "@/hooks/notifications.hooks";
import * as Notifications from "expo-notifications";
import { NotificationTimeProps } from "@/helpers/props.helper";

// change this before pushing to dev
const STORAGE_KEY = "test_schedule_preferences";

//Handle incoming notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function NotificationSettings() {
  const [notificationTimes, setNotificationTimes] = useState([
    {
      id: 1,
      time: "8:00 AM",
      isEnabled: false,
      isCustom: false,
      notificationID: null,
    },
    {
      id: 2,
      time: "8:00 PM",
      isEnabled: false,
      isCustom: false,
      notificationID: null,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  async function loadSavedPreferences() {
    try {
      setIsLoading(true);
      const savedPreferences = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedPreferences != null) {
        setNotificationTimes(JSON.parse(savedPreferences));
      } else {
        // if there are no saved preferences, load the default
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(notificationTimes)
        );
      }
    } catch (error) {
      console.error(
        "Error loading preferences:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleSwitch(id: number) {
    try {
      const updatedTimes = await Promise.all(
        notificationTimes.map(async (notificationTime) => {
          const newIsEnabledValue = !notificationTime.isEnabled;

          if (notificationTime.id === id) {
            if (newIsEnabledValue) {
              const formattedTime = formatTime(selectedTime);
              const notificationID = await schedulePushNotification(formattedTime);
              return {
                ...notificationTime,
                isEnabled: newIsEnabledValue,
                notificationID: notificationID,
              };
            } else {
              await cancelScheduledNotification(
                notificationTime.notificationID
              );
              return {
                ...notificationTime,
                isEnabled: newIsEnabledValue,
                notificationID: null,
              };
            }
          } else {
            return notificationTime;
          }
        })
      );

      setNotificationTimes(updatedTimes);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimes));

    } catch (error) {
      console.log(error);
    }
  }

  function addCustomTime(time: Date) {
    if (time) {
      setSelectedTime(time);
    }
  }

  async function confirmTime() {
    const formattedTime = formatTime(selectedTime);
    const id = await schedulePushNotification(formattedTime);
    if (selectedTime) {
      const newTime = {
        id: Date.now(),
        time: formattedTime,
        isEnabled: true,
        isCustom: true,
        notificationID: id,
      };
      const listOfNewTimes = [...notificationTimes, newTime];
      setNotificationTimes(listOfNewTimes);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(listOfNewTimes));
    }
    setShowModal(false);
  }

  async function removeCustomTime(id: number) {
    setNotificationTimes(
      notificationTimes.filter((time: NotificationTimeProps) => time.id !== id)
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notificationTimes));
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text>🔔</Text>
        <Text style={styles.title}>Notification Times</Text>
      </View>

      <View style={styles.timesList}>
        {notificationTimes.length > 0 &&
          notificationTimes.map((time) => (
            <TimeItem
              item={time}
              key={time.id}
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
              //   minuteInterval={10}
            />
            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => confirmTime()}
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
}

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
