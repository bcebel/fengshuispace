import { useState, useEffect } from "react";

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [permission, setPermission] = useState("unknown");

  const askPermission = async () => {
    // iOS Safari requires a user gesture to request permission
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const status = await DeviceOrientationEvent.requestPermission();
      setPermission(status);
      if (status !== "granted") return;
    } else {
      // Android/Desktop Chrome does not require this
      setPermission("granted");
    }

    window.addEventListener("deviceorientation", handleMotion, true);
  };

  const handleMotion = (event) => {
    // Browser returns degrees; convert to radians for Three.js
    const alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) : 0;
    const beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0;
    const gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0;

    // Note: On web, 'alpha' is sometimes treated differently.
    // You may need to use 'webkitCompassHeading' for true north.
    setOrientation({ alpha, beta, gamma });
  };

  useEffect(() => {
    return () =>
      window.removeEventListener("deviceorientation", handleMotion, true);
  }, []);

  return { orientation, permission, askPermission };
}
