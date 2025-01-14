import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Magnetometer } from "expo-sensors";
import { DeviceMotion } from "expo-sensors";
export default function App() {

  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);

  Magnetometer.isAvailableAsync().then((available) => {
    if (!available) {
      console.log("Magnetometer not available on this device.");
    }
  });

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        console.log("Permission Granted");
        const loc = await Location.getCurrentPositionAsync({});
        console.log(loc);
        setLocation(loc);
      } else {
        console.log("Permission Denied");
      }
    };

    getLocation(); // Call the async function
  }, []); // Empty array to run only once on mount


  useEffect(() => {
    const getHeading = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        console.log("Permission Granted");
        const hed = await Location.getHeadingAsync({});
        console.log(hed);
        setHeading(hed); // Corrected here
      } else {
        console.log("Permission Denied");
      }
    };

    getHeading();
  }, []);

  const [rotation, setRotation] = useState({ pitch: 0, yaw: 0 });

  useEffect(() => {
    const subscription = DeviceMotion.addListener((motionData) => {
      const { pitch, yaw } = motionData.rotation; // rotation data in radians
      setRotation({ pitch, yaw });
    });

    DeviceMotion.setUpdateInterval(16); // 60 FPS (1000 ms / 16 ms)

    return () => subscription.remove();
  }, []);
  
  return (
    <View style={styles.container}>
      <Text>{location ? JSON.stringify(location) : "Loading location..."}</Text>
      <Text>{heading ? JSON.stringify(heading) : "Loading heading..."}</Text>

      <Text>Open up App.tsx to start working on your app!</Text>
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
