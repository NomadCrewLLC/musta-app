import React, { useEffect, useState } from "react";
import { StyleSheet, Image, Switch } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as Notifications from "expo-notifications";
import data from "@/app/data/phrases.json";
import { isEnabled } from "react-native/Libraries/Performance/Systrace";

export default function TabTwoScreen() {
  const scheduledHourOptions = [3, 5];
  type scheduledHourProps = {
    isEnabled: boolean;
    notificationID: string | null;
  }
  const [switchStates, setSwitchStates] = useState<Record<number, scheduledHourProps>>({
    3: { isEnabled: false, notificationID: null },
    5: { isEnabled: false, notificationID: null },
  });
  const [lastToggledSwitch, setLastToggledSwitch] = useState<number[]>([]);
  const isEnabledValues = Object.values(switchStates).map(
    (scheduledHour) => scheduledHour.isEnabled
  );

  useEffect(() => {
    console.log("changed!");
    console.log("switchStates", switchStates);
    console.log("lastToggledSwitch", lastToggledSwitch);

    async function scheduleNotificationAndSetNotificationID(scheduledHour: number) {
      try {
        const id = await schedulePushNotification(scheduledHour);
        setSwitchStates((prevState) => ({
          ...prevState,
          [scheduledHour]: {
            ...prevState[scheduledHour],
            notificationID: id,
          },
        }));
      } catch (error) {
        console.log("error", error);
      }
    }

    if (lastToggledSwitch.length > 0) {
      lastToggledSwitch.forEach((scheduledHour) => {
        //schedule notification if switch was turned on
        if (switchStates[scheduledHour].isEnabled) {
          scheduleNotificationAndSetNotificationID(scheduledHour);
        }
        // cancel notification if switch was turned off, then set notification id to null
        else {
          cancelScheduledNotification(switchStates[scheduledHour].notificationID);
          setSwitchStates((prevState) => ({
            ...prevState,
            [scheduledHour]: {
              ...prevState[scheduledHour],
              notificationID: null,
            },
          }));
        }
      });

      setLastToggledSwitch([]);
    }

    console.log("switchStates afterrrr", switchStates);
  }, [isEnabledValues]); // run useEffect when the switches are enabled/disabled, not if notificationID is changed

  function toggleSwitch(scheduledHour: number) {
    setSwitchStates((prevState) => ({
      ...prevState,
      [scheduledHour]: {
        ...prevState[scheduledHour],
        isEnabled: !prevState[scheduledHour].isEnabled,
      },
    }));
    setLastToggledSwitch((toggledSwitches) => [...toggledSwitches, scheduledHour]);
  }

  async function schedulePushNotification(scheduledHour: number) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to learn a new phrase 🤓",
        body: renderRandomNotification(),
      },
      trigger: { seconds: scheduledHour },
    });
    return id;
  }

  async function cancelScheduledNotification(identifier: string | null) {
    if (identifier) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  }

  function renderRandomNotification() {
    const randomIndex = Math.floor(Math.random() * data.phrases.length);
    const randomPhrase = data.phrases[randomIndex];

    return `${randomPhrase.phrase} = ${randomPhrase.translation}`;
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>
        This app includes example code to help you get started.
      </ThemedText>
      {scheduledHourOptions.map((time) => {
        return (
          <ThemedView
            key={time}
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <ThemedText>Notify me every {time} seconds</ThemedText>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={switchStates[time].isEnabled ? "#f5dd4b" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => toggleSwitch(time)}
              value={switchStates[time].isEnabled}
            />
          </ThemedView>
        );
      })}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
