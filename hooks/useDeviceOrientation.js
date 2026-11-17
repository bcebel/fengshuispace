import { useState, useEffect, useRef } from "react";
import { DeviceMotion } from "expo-sensors";
import { Platform } from "react-native";


export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
    accelerationIncludingGravity: null,
  });
  const [permission, setPermission] = useState("unknown");
  const subRef = useRef(null);

const askPermission = async () => {
  let status = "granted";

  if (Platform.OS === "ios") {
    const result = await DeviceMotion.requestPermissionsAsync();
    status = result.status;
  }

  setPermission(status);
  if (status !== "granted") return;

  DeviceMotion.setUpdateInterval(16);
  if (subRef.current) subRef.current.remove();
  subRef.current = DeviceMotion.addListener((data) => {
   // console.log("motion raw:", JSON.stringify(data, null, 0)); // ← diagnostic
    if (data.rotation) {
      setOrientation({
        alpha: data.rotation.alpha,
        beta: data.rotation.beta,
        gamma: data.rotation.gamma,
        accelerationIncludingGravity: data.accelerationIncludingGravity,
      });
    }
  });
};
  useEffect(() => () => subRef.current?.remove(), []);

  return { orientation, permission, askPermission };
}
