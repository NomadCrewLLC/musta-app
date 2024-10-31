import React, { useEffect, useState } from "react";
import { StyleSheet, Image, Switch } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  schedulePushNotification,
  cancelScheduledNotification,
} from "@/hooks/notifications.hooks";
import { ScheduledTimeConfig, scheduledHourProps } from "@/helpers/props.helper";

const STORAGE_KEY = "notification_prefereces";

export default function TabTwoScreen() {
  const scheduledHourOptions = [3, 5];

  interface ScheduledTimeConfig {
    isEnabled: boolean;
    notificationID: string | null;
  }

  const [switchStates, setSwitchStates] = useState<ScheduledTimeConfig>({});
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  async function loadSavedPreferences() {
    try {
      setIsLoading(true);
      const savedPreferences = await AsyncStorage.getItem(STORAGE_KEY);

      if (savedPreferences != null) {
        setSwitchStates(JSON.parse(savedPreferences));
      } else {
        // initialized default states if no saved preferences exist
        const defaultStates = scheduledHourOptions.reduce(
          (acc, time) => ({
            ...acc,
            [time]: { isEnabled: false, notificationID: null },
          }),
          {}
        );
        setSwitchStates(defaultStates);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStates));
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

  async function toggleSwitch(time: number) {
    try {
      const newIsEnabledValue = !switchStates[time].isEnabled;
      if (newIsEnabledValue) {
        const id = await schedulePushNotification(time);

        const newSwitchStates = {
          ...switchStates,
          [time]: { isEnabled: newIsEnabledValue, notificationID: id },
        };

        setSwitchStates(newSwitchStates);

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(newSwitchStates)
        );
      } else {
        await cancelScheduledNotification(switchStates[time].notificationID);

        const newSwitchStates = {
          ...switchStates,
          [time]: { isEnabled: newIsEnabledValue, notificationID: null },
        };

        setSwitchStates(newSwitchStates);
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(newSwitchStates)
        );
      }
    } catch (error) {
      console.log(error);
    }
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
        <ThemedText type="title">Settings</ThemedText>
      </ThemedView>
      <ThemedText>Set your preferred notification frequency.</ThemedText>
      {Object.keys(switchStates).length > 0 &&
        scheduledHourOptions.map((time) => {
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
                thumbColor={
                  switchStates[time].isEnabled ? "#f5dd4b" : "#f4f3f4"
                }
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
