"use dom";
// ✅ Hermes-compatible patch for WebGL getProgramInfoLog
if (
  global.WebGLRenderingContext &&
  typeof global.WebGLRenderingContext.prototype.getProgramInfoLog === "function"
) {
  const original = global.WebGLRenderingContext.prototype.getProgramInfoLog;
  global.WebGLRenderingContext.prototype.getProgramInfoLog = function (...args) {
    const result = original.apply(this, args);
    return typeof result === "string" ? result : "";
  };
}
import { StyleSheet, } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import Zapp from "@/components/Fiber";
import React from "react";



export default function HomeScreen() {
  return (

      <ThemedView style={styles.titleContainer}>
        <Zapp />
      </ThemedView>



   
  
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
