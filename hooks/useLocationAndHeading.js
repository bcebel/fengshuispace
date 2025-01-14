import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Magnetometer, DeviceMotion } from "expo-sensors";

export function useMotionAndSensors() {
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);
  const [rotation, setRotation] = useState({ pitch: 0, yaw: 0 });
  const [magneticHeading, setMagneticHeading] = useState(null);

  useEffect(() => {
    // Get location and true heading
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const hed = await Location.getHeadingAsync({});
        setHeading(hed.trueHeading);
      } else {
        console.warn("Location permission denied");
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    // Magnetometer (for compass heading)
    const magnetometerSubscription = Magnetometer.addListener((data) => {
      const { x, y } = data;
      const angle = Math.atan2(y, x) * (180 / Math.PI); // Convert radians to degrees
      const magneticHeading = angle >= 0 ? angle : angle + 360; // Normalize to 0-360
      setMagneticHeading(magneticHeading);
    });

    Magnetometer.setUpdateInterval(16); // Update ~60 FPS

    return () => magnetometerSubscription.remove();
  }, []);

  useEffect(() => {
    // Device Motion (for pitch, roll, yaw)
    const motionSubscription = DeviceMotion.addListener((motionData) => {
      const { pitch, yaw } = motionData.rotation;
      setRotation({ pitch, yaw });
    });

    DeviceMotion.setUpdateInterval(16); // Update ~60 FPS

    return () => motionSubscription.remove();
  }, []);

  return { location, heading, magneticHeading, rotation };
}
