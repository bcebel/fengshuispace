import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Magnetometer } from "expo-sensors";

export default function Compass() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Subscribe to Magnetometer updates
  const subscribe = () => {
    setSubscription(
      Magnetometer.addListener((data) => {
        setData(data);
      })
    );
  };

  // Unsubscribe from Magnetometer updates
  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  // Calculate heading (angle from magnetic north)
  const calculateHeading = () => {
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return angle >= 0 ? angle : 360 + angle; // Ensure the range is 0-360
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Magnetometer Data:</Text>
      <Text style={styles.text}>X: {x.toFixed(2)}</Text>
      <Text style={styles.text}>Y: {y.toFixed(2)}</Text>
      <Text style={styles.text}>Z: {z.toFixed(2)}</Text>
      <Text style={styles.text}>Heading: {calculateHeading().toFixed(2)}°</Text>
      <TouchableOpacity
        onPress={subscription ? unsubscribe : subscribe}
        style={styles.button}
      >
        <Text style={styles.text}>
          {subscription ? "Stop" : "Start"} Magnetometer
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    margin: 10,
  },
  button: {
    padding: 10,
    backgroundColor: "#333",
    marginTop: 20,
  },
});
