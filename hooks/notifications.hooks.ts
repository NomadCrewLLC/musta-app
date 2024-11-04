import * as Notifications from "expo-notifications";
import data from "@/app/data/phrases.json";
import { parseDate } from "@/helpers/datetime.helper";

function renderRandomNotification() {
    const randomIndex = Math.floor(Math.random() * data.phrases.length);
    const randomPhrase = data.phrases[randomIndex];

    return `${randomPhrase.phrase} = ${randomPhrase.translation}`;
  }

export async function schedulePushNotification(selectedTime: string) {
    console.log('selectedTime schedulePushNotification', selectedTime);
    const trigger = {
        hour: parseDate(selectedTime).hour,
        minute: parseDate(selectedTime).minute,
        repeats: true,
    }
    console.log('trigger', trigger);

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
        trigger: {seconds: 3},
      });
  }