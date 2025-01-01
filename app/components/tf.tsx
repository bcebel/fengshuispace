import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gyroscope } from "expo-sensors";
import { WebView } from "react-native-webview";

export default function App() {
  const [gyroscopeData, setGyroscopeData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const subscription = Gyroscope.addListener((data) => {
      setGyroscopeData(data);
    });

    Gyroscope.setUpdateInterval(5000); // Adjust for smoother updates

    return () => subscription.remove();
  }, []);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; overflow: hidden; }
        </style>
      </head>
      <body>
        <canvas id="three-canvas"></canvas>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script>
    
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("three-canvas") });
          renderer.setSize(window.innerWidth, window.innerHeight);
    const texture = new THREE.TextureLoader().load( "../../assets/images/fs.png" );
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          const cube = new THREE.Mesh(texture, geometry, material);
          scene.add(cube);

          camera.position.z =1;

          function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
          }
          animate();

          // Update camera rotation from gyroscope data
          window.updateGyroscope = function(x, y, z) {
            camera.rotation.x = x;
            camera.rotation.y = y;
          };
        </script>
      </body>
    </html>
  `;

  const injectedJavaScript = `
    setInterval(() => {
      const message = JSON.stringify(${JSON.stringify(gyroscopeData)});
      if (window.updateGyroscope) {
        const data = JSON.parse(message);
        window.updateGyroscope(data.x, data.y, data.z);
      }
    }, 100);
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1 }}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
