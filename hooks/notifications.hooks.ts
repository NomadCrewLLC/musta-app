import * as Notifications from "expo-notifications";
import data from "@/app/data/phrases.json";

function renderRandomNotification() {
    const randomIndex = Math.floor(Math.random() * data.phrases.length);
    const randomPhrase = data.phrases[randomIndex];

    return `${randomPhrase.phrase} = ${randomPhrase.translation}`;
  }

export async function schedulePushNotification(scheduledHour: number) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to learn a new phrase 🤓",
        body: renderRandomNotification(),
      },
      trigger: { seconds: scheduledHour },
    });
    return id;
  }


  export async function cancelScheduledNotification(identifier: string | null) {
    if (identifier) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  }