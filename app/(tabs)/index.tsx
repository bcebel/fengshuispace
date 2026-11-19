"use dom";
// ✅ Hermes-compatible patch for WebGL getProgramInfoLog
if (
  global.WebGLRenderingContext &&
  typeof global.WebGLRenderingContext.prototype.getProgramInfoLog === "function"
) {
  const original = global.WebGLRenderingContext.prototype.getProgramInfoLog;
  global.WebGLRenderingContext.prototype.getProgramInfoLog = function (
    ...args
  ) {
    const result = original.apply(this, args);
    return typeof result === "string" ? result : "";
  };
}

import { StyleSheet, View } from "react-native";
import Panorama from "./Panorama"; // Metro figures out .web.tsx vs .tsx
import React from "react";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Panorama />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Good to have a fallback
  },
});