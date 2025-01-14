import React, { useState, useEffect } from "react";
import { StatusBar, Dimensions, Text, View } from "react-native";
import { DeviceMotion } from "expo-sensors";

const { height, width } = Dimensions.get("window");
const centerX = width / 2,
  centerY = height / 2;

export default function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    _subscribe();
    StatusBar.setHidden(true, "fade");
    return () => {
      _unsubscribe();
    };
  }, []);

  const _setInterval = () => {
    DeviceMotion.setUpdateInterval(77); // Set the update interval (in milliseconds)
  };

  const _subscribe = () => {
    DeviceMotion.addListener((devicemotionData) => {
      setData(devicemotionData.rotation); // Set the rotation data (gamma and beta)
    });
    _setInterval();
  };

  const _unsubscribe = () => {
    DeviceMotion.removeAllListeners(); // Remove all listeners
  };

  // Safely destructure gamma and beta with default values
  const { beta = 0, gamma = 0 } = data;

  const roundedGamma = round(gamma); // Round gamma to 2 decimal places
  const roundedBeta = round(beta); // Round beta to 2 decimal places

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        backgroundColor: "#BBB",
      }}
    >
      {/* Display gamma and beta values */}
      <Text>Gamma: {roundedGamma}</Text>
      <Text>Beta: {roundedBeta}</Text>
    </View>
  );
}

function round(n) {
  if (!n) {
    return 0;
  }
  return Math.floor(n * 100) / 100; // Round the number to 2 decimal places
}
