import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import data from '@/app/data/phrases.json';
import { parseTimeIntoObject, parseTimeIntoString } from '@/helpers/datetime.helper';

const DAYS_TO_SCHEDULE = 30; // Schedule a month's worth of notifications

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      await AsyncStorage.setItem('pushToken', token);
      console.log(token);
    } catch (error) {
      token = `${error}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }
  return token;
}

function renderRandomNotification() {
  const randomIndex = Math.floor(Math.random() * data.phrases.length);
  const randomPhrase = data.phrases[randomIndex];

  return `${randomPhrase.phrase} = ${randomPhrase.translation}`;
}

export async function scheduleLocalNotifications(selectedTime: string) {
  const notificationID = parseTimeIntoString(selectedTime);

  // Schedule notifications for the next DAYS_TO_SCHEDULE days
  for (let day = 0; day < DAYS_TO_SCHEDULE; day++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + day);

    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: futureDate.getFullYear(),
      month: futureDate.getMonth() + 1,
      day: futureDate.getDate(),
      hour: parseTimeIntoObject(selectedTime).hour,
      minute: parseTimeIntoObject(selectedTime).minute,
      repeats: false, // Set to false since each notification is unique
    };

    const dailyNotificationID = `${notificationID}-${day}`;
    await Notifications.scheduleNotificationAsync({
      identifier: dailyNotificationID,
      content: {
        title: 'Time to learn a new phrase 🤓',
        body: renderRandomNotification(), // Each day will get a different random notification
      },
      trigger,
    });
  }

  return notificationID;
}

// Helper function to cleanup all scheduled notifications
export async function cleanupNotifications(baseId: string) {
  for (let day = 0; day < DAYS_TO_SCHEDULE; day++) {
    const dailyId = `${baseId}-${day}`;
    await Notifications.cancelScheduledNotificationAsync(dailyId);
  }
}

export async function cancelScheduledNotification(identifier: string | null) {
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

export async function getAllScheduledNotifications() {
  const allNotifications = await Notifications.getAllScheduledNotificationsAsync();

  return allNotifications;
}

//for testing purposes
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getExistingNotifications(notificationID: string | null) {
  const scheduledNotifications = await getAllScheduledNotifications();

  return scheduledNotifications.filter((notification) =>
    notification.identifier.startsWith(notificationID ?? '')
  );
}
