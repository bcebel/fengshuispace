import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export default function App() {
  const [location, setLocation] = useState(null);

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

  return (
    <View style={styles.container}>
      <Text>{location ? JSON.stringify(location) : "Loading location..."}</Text>
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
