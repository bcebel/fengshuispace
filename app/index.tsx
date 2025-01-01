import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import App from "./components/wombat"; // Import the 3D scene 
// component
import Howdy from "./components/tf"; // Import the 3D scene component
export default function Index() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://fengshuispace-44ba12f83e89.herokuapp.com/api") // Replace with your backend URL
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error(error));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message || "Loading..!."}</Text>
      <View style={styles.threeContainer}>
        {/* Render the 3D scene */}
        <App />
        <Howdy />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  message: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: "center",
  },
  threeContainer: {
    flex: 1,
    width: "100%",
  },
});
