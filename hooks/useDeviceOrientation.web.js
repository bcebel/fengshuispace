import { useState, useEffect, useCallback } from "react";
import * as THREE from "three";

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [permission, setPermission] = useState("unknown");

  const handleMotion = useCallback((event) => {
    const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) : 0;
    const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
    const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;

    setOrientation({ alpha, beta, gamma });
  }, []);

  const askPermission = useCallback(async () => {
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      try {
        const status = await DeviceOrientationEvent.requestPermission();
        setPermission(status);
        if (status !== "granted") return;
      } catch {
        setPermission("denied");
        return;
      }
    } else {
      setPermission("granted");
    }

    window.addEventListener("deviceorientation", handleMotion, true);
  }, [handleMotion]);

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleMotion, true);
    };
  }, [handleMotion]);

  return { orientation, permission, askPermission };
}
