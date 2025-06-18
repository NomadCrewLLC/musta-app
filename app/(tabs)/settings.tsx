import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
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
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from '@/components/LanguageContext';

const STORAGE_KEY = 'my_schedule_preferences';

// Handle incoming notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: false,
  }),
});

export default function NotificationSettings() {
  const { currentLanguage } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<NotificationTimeProps | null>(null);
  const [selectEditTime, setSelectEditTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [notificationTimes, setNotificationTimes] = useState<NotificationTimeProps[]>([
    { id: 1, time: '8:00 AM', isEnabled: false, isCustom: false, notificationID: null },
    { id: 2, time: '8:00 PM', isEnabled: false, isCustom: false, notificationID: null },
  ]);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register for push notifications on component mount
  useEffect(() => {
    registerForPushNotificationsAsync().catch((err) => {
      setError('Failed to register for notifications: ' + (err.message || 'Unknown error'));
      showErrorToast('Failed to register for notifications');
    });
  }, []);

  // Load saved preferences when component mounts or language changes
  useEffect(() => {
    loadSavedPreferences();
  }, [currentLanguage?.id]);

  // Check for any changes when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (currentLanguage?.id) {
        checkAndRescheduleNotifications(notificationTimes).catch((err) => {
          setError('Failed to reschedule notifications: ' + (err.message || 'Unknown error'));
          showErrorToast('Failed to reschedule notifications');
        });
      }
    }, [notificationTimes, currentLanguage?.id])
  );

  async function loadSavedPreferences() {
    try {
      setIsLoading(true);
      setError(null); // Reset error state when loading
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading preferences:', errorMessage);
      setError('Failed to load preferences: ' + errorMessage);
      showErrorToast('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }

  async function checkNotificationLimit() {
    try {
      const allNotifications = await getAllScheduledNotifications();
      const notificationCount = allNotifications.length;
      const MAX_NOTIFICATIONS = 49; // iOS limit is 64, leaving buffer for new schedules

      setIsLimitReached(notificationCount >= MAX_NOTIFICATIONS);

      return notificationCount;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to check notification limit: ' + errorMessage);
      showErrorToast('Failed to check notification limit');
      return 0;
    }
  }

  async function checkAndRescheduleNotifications(notificationTimes: NotificationTimeProps[]) {
    try {
      for (const schedule of notificationTimes.filter((s) => s.isEnabled)) {
        const existingNotifications = await getExistingNotifications(schedule.notificationID);

        // Cancel existing notifications
        await Promise.all(
          existingNotifications.map((notification) =>
            cancelScheduledNotification(notification.identifier)
          )
        );

        // Schedule new notifications with current language
        await scheduleLocalNotifications(schedule.time, currentLanguage?.id || '');
        showNotificationsRenewedToast(schedule.time);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to reschedule notifications: ' + errorMessage);
      showErrorToast('Failed to reschedule notifications');
      throw error; // Re-throw to handle in calling function if needed
    }
  }

  async function toggleSwitch(id: number) {
    try {
      setError(null); // Reset error state
      const updatedTimes = await Promise.all(
        notificationTimes.map(async (reminder) => {
          const newIsEnabledValue = !reminder.isEnabled;

          if (reminder.id === id) {
            if (newIsEnabledValue) {
              await scheduleLocalNotifications(reminder.time, currentLanguage?.id || '');
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(error);
      setError('Failed to toggle notification: ' + errorMessage);
      showErrorToast('Failed to toggle notification');
    }
  }

  async function confirmTime() {
    try {
      setError(null); // Reset error state
      const formattedTime = formatTime(selectedTime);
      const id = await scheduleLocalNotifications(formattedTime, currentLanguage?.id || '');
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to add notification time: ' + errorMessage);
      showErrorToast('Failed to add notification time');
    }
  }

  function addCustomTime() {
    setSelectedTime(new Date());
    setShowModal(true);
  }

  async function editCustomTime(id: number) {
    try {
      setError(null); // Reset error state
      const schedule = notificationTimes.find((time) => time.id === id);

      // set the time the same as the selectedSchedule.time
      if (schedule) {
        setSelectedSchedule(schedule);
        const utcDate = formatToDateObject(schedule.time);

        setSelectedTime(utcDate);
        setShowEditModal(true);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to edit notification time: ' + errorMessage);
      showErrorToast('Failed to edit notification time');
    }
  }

  async function confirmEditTime() {
    try {
      setError(null); // Reset error state
      if (selectEditTime && selectedSchedule) {
        await Notifications.cancelScheduledNotificationAsync(selectedSchedule.notificationID || '');
        const formattedTime = formatTime(selectEditTime);
        const notificationID = await scheduleLocalNotifications(
          formattedTime,
          currentLanguage?.id || ''
        );

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to confirm edit: ' + errorMessage);
      showErrorToast('Failed to update notification time');
    }
  }

  function onChangeTime(time: Date) {
    setSelectedTime(time);
  }

  function onChangeEditTime(time: Date) {
    setSelectEditTime(time);
  }

  async function removeCustomTime(id: number) {
    try {
      setError(null); // Reset error state
      const timeToRemove = notificationTimes.find((time) => time.id === id);

      // Cancel notifications for this time if they exist
      if (timeToRemove?.notificationID) {
        const existingNotifications = await getExistingNotifications(timeToRemove.notificationID);
        for (const notification of existingNotifications) {
          await cancelScheduledNotification(notification.identifier);
        }
      }

      const updatedTimes = notificationTimes.filter((time) => time.id !== id);
      setNotificationTimes(updatedTimes);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTimes));
      await checkNotificationLimit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to remove notification time: ' + errorMessage);
      showErrorToast('Failed to remove notification time');
    }
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

  function showErrorToast(message: string) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      visibilityTime: 4000,
    });
  }

  // Loading state or no language available
  if (isLoading) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  // No language available
  if (!currentLanguage) {
    return (
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView style={styles.centerContainer}>
          <Text style={styles.errorText}>Language not available</Text>
          <Text style={styles.errorSubText}>Please select a language in settings</Text>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={{ flex: 1, paddingTop: 24 }}>
        <Toast />
        <NotificationHeader flag={currentLanguage?.flag} />

        {/* Display error message if there is one */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
  },
  errorSubText: {
    color: '#d32f2f',
    fontSize: 14,
    marginTop: 5,
  },
  loadingText: {
    marginTop: 10,
    color: '#757575',
    fontSize: 16,
  },
});
