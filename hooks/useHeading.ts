// hooks/useHeading.ts
import { useEffect, useState } from "react";
import * as Location from "expo-location";

export const useHeading = () => {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          return;
        }

        const subscription = await Location.watchHeadingAsync((data) => {
          setHeading(data.trueHeading); // Use trueHeading or magHeading based on your need
        });

        // Cleanup
        return () => subscription.remove();
      } catch (err) {
        setError(err.message || "Unknown error");
      }
    };

    startWatching();
  }, []);

  return { heading, error };
};
