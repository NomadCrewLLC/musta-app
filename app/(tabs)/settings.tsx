import React, { useState } from "react";
import { StyleSheet, Image, Switch } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function TabTwoScreen() {
  type SwitchDuration = 'notifyEvery3Seconds' | 'notifyEvery5Seconds';
  const [isEnabled, setIsEnabled] = useState(false);
  const [switchStates, setSwitchStates] = useState<Record<SwitchDuration, boolean>>({
    notifyEvery3Seconds: false,
    notifyEvery5Seconds: false,
  })

  function toggleSwitch(switchName: SwitchDuration) {
    setSwitchStates((prevState) => ({
      ...prevState,
      [switchName]: !prevState[switchName],
    })) 
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
      <ThemedView style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <ThemedText>Notify me every 3 seconds</ThemedText>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch('notifyEvery3Seconds')}
          value={switchStates.notifyEvery3Seconds}
        />
      </ThemedView>
      <ThemedView style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <ThemedText>Notify me every 5 seconds</ThemedText>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => toggleSwitch('notifyEvery5Seconds')}
          value={switchStates.notifyEvery5Seconds}
        />
      </ThemedView>
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
