import { useState, useEffect } from "react";

export function useHeading() {
  const [magHeading, setMagHeading] = useState(null);
  const [trueHeading, setTrueHeading] = useState(null);
  const [permission, setPermission] = useState("unknown");

  const askPermission = async () => {
    // iOS requires permission
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const status = await DeviceOrientationEvent.requestPermission();
      setPermission(status);
    } else {
      setPermission("granted");
    }
  };

  useEffect(() => {
    const handleHeading = (event) => {
      let heading = null;

      // 1. iOS Safari
      if (event.webkitCompassHeading != null) {
        heading = event.webkitCompassHeading;
      }
      // 2. Android Chrome (Absolute Alpha)
      else if (event.absolute === true && event.alpha != null) {
        // Android alpha goes counter-clockwise, so we do 360 - alpha for compass heading
        heading = 360 - event.alpha;
      }

      if (heading != null) {
        setMagHeading(heading);
        setTrueHeading(heading);
      }
    };

    // Listen to BOTH events to cover all browsers
    window.addEventListener("deviceorientationabsolute", handleHeading, true);
    window.addEventListener("deviceorientation", handleHeading, true);

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleHeading,
        true,
      );
      window.removeEventListener("deviceorientation", handleHeading, true);
    };
  }, []);

  return { trueHeading, magHeading, permission, askPermission };
}
