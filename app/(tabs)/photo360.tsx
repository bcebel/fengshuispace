"use dom";
import { StyleSheet, View, Image, Platform } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
 import { ThemedView } from "@/components/ThemedView";
import Xapp from "@/components/Fiber";
import React from "react";
export default function TabTwoScreen() {
  return (
<ThemedView style={styles.container} ><Xapp /></ThemedView>
      

  );
}

const styles = StyleSheet.create({
  fsImage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 5278,
    width: 590,
    top: 1000,
    left: 0,
    position: "absolute",
  },
  container: {
    backgroundColor: "green",
    height: 500,
    width: 300,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
