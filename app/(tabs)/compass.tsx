import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Location from "expo-location";

export default function CompassTest() {
  const [permission, setPermission] = useState("unknown");
  const [heading, setHeading] = useState(null);
  const [trueHeading, setTrueHeading] = useState(null);

  const askPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    if (status !== "granted") return;

    const h = await Location.getHeadingAsync();
    setHeading(h.magHeading);
    setTrueHeading(h.trueHeading);

    Location.watchHeadingAsync((h) => {
      setHeading(h.magHeading);
      setTrueHeading(h.trueHeading);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Permission: {permission}</Text>
      <Text style={styles.label}>
        Magnetic: {heading !== null ? heading.toFixed(1) + "°" : "—"}
      </Text>
      <Text style={styles.label}>
        True: {trueHeading !== null ? trueHeading.toFixed(1) + "°" : "—"}
      </Text>
      {permission !== "granted" && (
        <Pressable style={styles.button} onPress={askPermission}>
          <Text style={styles.buttonText}>Enable Compass</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  label: { fontSize: 16, fontVariant: ["tabular-nums"] },
  button: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16 },
});
