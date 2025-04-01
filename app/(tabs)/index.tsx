import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast, { BaseToast, BaseToastProps } from 'react-native-toast-message';
import { formatTime, formatToDateObject, parseTimeIntoString } from '@/helpers/datetime.helper';
import {
  scheduleLocalNotifications,
  cancelScheduledNotification,
  registerForPushNotificationsAsync,
  getExistingNotifications,
  getAllScheduledNotifications,
} from '@/hooks/notifications.hooks';
import * as Notifications from 'expo-notifications';
import { NotificationTimeProps } from '@/helpers/props.helper';
import { AddEditTimeModal } from '@/components/AddEditTimeModal';
import { NotificationHeader } from '@/components/NotificationHeader';
import { AddTimeButton } from '@/components/AddTimeButton';
import { NotificationTimesList } from '@/components/NotificationTimesList';
import { NotificationButtonDescription } from '@/components/NotificationButtonDescription';

const STORAGE_KEY = 'my_schedule_preferences';

//Handle incoming notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationSettings() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<NotificationTimeProps | null>(null);
  const [selectEditTime, setSelectEditTime] = useState<Date>(new Date());
  const [loading, setIsLoading] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<NotificationTimeProps[]>([
    { id: 1, time: '8:00 AM', isEnabled: false, isCustom: false, notificationID: null },
    { id: 2, time: '8:00 PM', isEnabled: false, isCustom: false, notificationID: null },
  ]);
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  async function loadSavedPreferences() {
    try {
      setIsLoading(true);
      const savedPreferences = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedPreferences != null) {
        const parsedPreferences = JSON.parse(savedPreferences);
        setNotificationTimes(parsedPreferences);
        await checkAndRescheduleNotifications(parsedPreferences);
        await checkNotificationLimit();
      } else {
        // if there are no saved preferences, load the default
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notificationTimes));
        await checkAndRescheduleNotifications(notificationTimes);
      }
    } catch (error) {
      console.error(
        'Error loading preferences:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function checkNotificationLimit() {
    const allNotifications = await getAllScheduledNotifications();
    const notificationCount = allNotifications.length;
    const MAX_NOTIFICATIONS = 49; // iOS limit is 64, leaving buffer for new schedules

    setIsLimitReached(notificationCount >= MAX_NOTIFICATIONS);

    return notificationCount;
  }

  async function checkAndRescheduleNotifications(notificationTimes: NotificationTimeProps[]) {
    for (const schedule of notificationTimes.filter((s) => s.isEnabled)) {
      const existingNotifications = await getExistingNotifications(schedule.notificationID);

      if (existingNotifications.length < 2) {
        await Promise.all(
          existingNotifications.map((notification) =>
            cancelScheduledNotification(notification.identifier)
          )
        );
      }
      await scheduleLocalNotifications(schedule.time);
      showNotificationsRenewedToast(schedule.time);
    }
  }

  async function toggleSwitch(id: number) {
    try {
      const updatedTimes = await Promise.all(
        notificationTimes.map(async (reminder) => {
          const newIsEnabledValue = !reminder.isEnabled;

          if (reminder.id === id) {
            if (newIsEnabledValue) {
              await scheduleLocalNotifications(reminder.time);
              showNotificationsSetToast(reminder.time);
              return {
                ...reminder,
                isEnabled: newIsEnabledValue,
                notificationID: parseTimeIntoString(reminder.time),
              };
            } else {
              const existingNotifications = await getExistingNotifications(reminder.notificationID);
              for (const notification of existingNotifications) {
                cancelScheduledNotification(notification.identifier);
              }

              return {
                ...reminder,
                isEnabled: newIsEnabledValue,
                notificationID: null,
              };
            }
          } else {
            return reminder;
          }
        })
      );
      setNotificationTimes(updatedTimes);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimes));
      await checkNotificationLimit();
    } catch (error) {
      console.log(error);
    }
  }

  async function confirmTime() {
    const formattedTime = formatTime(selectedTime);
    const id = await scheduleLocalNotifications(formattedTime);
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
      await checkNotificationLimit();
    }
    setShowModal(false);
    showNotificationsSetToast(formattedTime);
  }

  function addCustomTime() {
    setSelectedTime(new Date());
    setShowModal(true);
  }

  async function editCustomTime(id: number) {
    const schedule = notificationTimes.find((time) => time.id === id);

    // set the time the same as the selectedSchedule.time
    if (schedule) {
      setSelectedSchedule(schedule);
      const utcDate = formatToDateObject(schedule.time);

      setSelectedTime(utcDate);
      setShowEditModal(true);
    }
  }

  async function confirmEditTime() {
    if (selectEditTime && selectedSchedule) {
      await Notifications.cancelScheduledNotificationAsync(selectedSchedule.notificationID || '');
      const formattedTime = formatTime(selectEditTime);
      const notificationID = await scheduleLocalNotifications(formattedTime);

      const updatedSchedule = {
        ...selectedSchedule,
        time: formattedTime,
        notificationID,
      };

      // Update notification times immutably
      const newNotificationTimes = notificationTimes.map((time) =>
        time.id === selectedSchedule.id ? updatedSchedule : time
      );

      setNotificationTimes(newNotificationTimes);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newNotificationTimes));
    }

    setShowEditModal(false);
  }

  function onChangeTime(time: Date) {
    setSelectedTime(time);
  }

  function onChangeEditTime(time: Date) {
    setSelectEditTime(time);
  }

  async function removeCustomTime(id: number) {
    setNotificationTimes(notificationTimes.filter((time: NotificationTimeProps) => time.id !== id));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notificationTimes));
    await checkNotificationLimit();
  }

  function showNotificationsRenewedToast(time: string) {
    Toast.show({
      type: 'info',
      text1: 'Notifications Renewed',
      text2: `Daily notifications renewed at ${time}.`,
    });
  }

  function showNotificationsSetToast(time: string) {
    Toast.show({
      type: 'success',
      text1: 'Notifications Set',
      text2: `Daily notifications scheduled for ${time}.`,
    });
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={{ flex: 1, paddingTop: 24 }}>
        <Toast />
        <NotificationHeader />
        <NotificationTimesList
          notificationTimes={notificationTimes}
          toggleSwitch={toggleSwitch}
          removeCustomTime={removeCustomTime}
          editCustomTime={editCustomTime}
        />
        <AddTimeButton onPress={addCustomTime} isDisabled={isLimitReached} />
        <NotificationButtonDescription isLimitReached={isLimitReached} />
        <AddEditTimeModal
          title="Add Time"
          value={selectedTime}
          visible={showModal}
          onRequestClose={() => setShowModal(false)}
          onClose={() => setShowModal(false)}
          onChangeTime={(event, time) => onChangeTime(time)}
          onConfirm={() => confirmTime()}
        />
        <AddEditTimeModal
          title="Edit Time"
          value={selectedTime}
          visible={showEditModal}
          onRequestClose={() => setShowEditModal(false)}
          onClose={() => setShowEditModal(false)}
          onChangeTime={(event, time) => onChangeEditTime(time)}
          onConfirm={confirmEditTime}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
