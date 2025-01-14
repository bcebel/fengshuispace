import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { DeviceMotion } from "expo-sensors";

export default function App() {
  const [rotation, setRotation] = useState({ pitch: 0, roll: 0, yaw: 0 });

  useEffect(() => {
    const setupDeviceMotion = async () => {
      const { status } = await DeviceMotion.getPermissionsAsync();
      if (status === "granted") {
        console.log("Permission Granted");

        const subscription = DeviceMotion.addListener((rotationData) => {
          const { rotation } = rotationData; // Get rotation object

          // Safely extract rotation values with fallbacks
          const pitch = rotation?.pitch || 0;
          const roll = rotation?.roll || 0;
          const yaw = rotation?.yaw || 0;

          setRotation({ pitch, roll, yaw }); // Update state
        });

        DeviceMotion.setUpdateInterval(16); // 60 FPS

        // Cleanup listener on unmount
        return () => subscription.remove();
      } else {
        console.log("Permission Denied");
      }
    };

    setupDeviceMotion();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Pitch: {rotation.pitch.toFixed(2)}</Text>
      <Text>Roll: {rotation.roll.toFixed(2)}</Text>
      <Text>Yaw: {rotation.yaw.toFixed(2)}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
