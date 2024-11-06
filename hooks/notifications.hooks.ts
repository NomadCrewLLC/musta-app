import * as Notifications from "expo-notifications";
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import data from "@/app/data/phrases.json";
import { parseDate } from "@/helpers/datetime.helper";

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error("Project ID not found");
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      await AsyncStorage.setItem("pushToken", token);
      console.log(token);
    } catch (error) {
      token = `${error}`;
    }
  } else {
    alert("Must use physical device for Push Notifications");
  }
  return token;
}

function renderRandomNotification() {
  const randomIndex = Math.floor(Math.random() * data.phrases.length);
  const randomPhrase = data.phrases[randomIndex];

  return `${randomPhrase.phrase} = ${randomPhrase.translation}`;
}

export async function schedulePushNotification(selectedTime: string) {
  const trigger = {
    hour: parseDate(selectedTime).hour,
    minute: parseDate(selectedTime).minute,
    repeats: true,
  };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to learn a new phrase 🤓",
      body: renderRandomNotification(),
    },
    trigger,
  });
  return id;
}

export async function cancelScheduledNotification(identifier: string | null) {
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}

export async function forTestingTriggerNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Time to learn a new phrase 🤓",
      body: renderRandomNotification(),
    },
    trigger: { seconds: 3 },
  });
}
