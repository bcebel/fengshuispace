import { useState, useEffect, useRef } from "react";
import { DeviceMotion } from "expo-sensors";

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [permission, setPermission] = useState("unknown");
  const subRef = useRef(null);

  const askPermission = async () => {
    const { status } = await DeviceMotion.requestPermissionsAsync();
    setPermission(status);
    if (status !== "granted") return;

    DeviceMotion.setUpdateInterval(16);
    if (subRef.current) subRef.current.remove();
    subRef.current = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        setOrientation({
          alpha: data.rotation.alpha,
          beta: data.rotation.beta,
          gamma: data.rotation.gamma,
        });
      }
    });
  };

  useEffect(() => () => subRef.current?.remove(), []);

  return { orientation, permission, askPermission };
}
