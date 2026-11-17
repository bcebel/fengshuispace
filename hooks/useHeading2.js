import { useState, useEffect, useRef } from "react";
import * as Location from "expo-location";

export function useHeading() {
  const [magHeading, setMagHeading] = useState(null);
  const [trueHeading, setTrueHeading] = useState(null);
  const [permission, setPermission] = useState("unknown");
  const subRef = useRef(null);

  const askPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermission(status);
    if (status !== "granted") return;

    const initial = await Location.getHeadingAsync();
    setMagHeading(initial.magHeading);
    setTrueHeading(initial.trueHeading >= 0 ? initial.trueHeading : null);

    subRef.current = await Location.watchHeadingAsync((h) => {
      setMagHeading(h.magHeading);
      setTrueHeading(h.trueHeading >= 0 ? h.trueHeading : null);
    });
  };

  useEffect(() => () => subRef.current?.remove?.(), []);

  return { magHeading, trueHeading, permission, askPermission };
}
