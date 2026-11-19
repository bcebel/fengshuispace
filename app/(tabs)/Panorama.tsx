import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import {
  Canvas,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber/native";
import * as THREE from "three";
import { TextureLoader } from "expo-three";
import { useDeviceOrientation } from "../../hooks/useDeviceOrientation";
import { useHeading } from "../../hooks/useHeading2";
import PANO_URL from "../../assets/images/bagua.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const RADIUS = 4.5;
const PANO_NORTH_OFFSET_DEG = 157.5;

// Pre-allocated math objects — avoids GC churn every frame
const euler = new THREE.Euler();
const qDevice = new THREE.Quaternion();
const qScreen = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90° around X
const qCompass = new THREE.Quaternion();
const yAxis = new THREE.Vector3(0, 1, 0);
const forward = new THREE.Vector3();

const BAGUA_SECTORS = [
  { dir: "N", element: "Water", trigram: "☵", angle: 0, color: "#4A90E2" },
  { dir: "NE", element: "Earth", trigram: "☶", angle: 45, color: "#C9A27E" },
  { dir: "E", element: "Wood", trigram: "☳", angle: 90, color: "#5A9F68" },
  { dir: "SE", element: "Wood", trigram: "☴", angle: 135, color: "#7FB88A" },
  { dir: "S", element: "Fire", trigram: "☲", angle: 180, color: "#D85A4E" },
  { dir: "SW", element: "Earth", trigram: "☷", angle: 225, color: "#D3B8A6" },
  { dir: "W", element: "Metal", trigram: "☱", angle: 270, color: "#B0B0B0" },
  { dir: "NW", element: "Metal", trigram: "☰", angle: 315, color: "#D1D1D1" },
];

function PanoramaScene({ orientation, trueHeading, magHeading, onProject }) {
  const { camera } = useThree();
  const texture = useLoader(TextureLoader, PANO_URL);
  const offsetRef = useRef(null);

  // Pre-allocate a vector for projection to avoid GC
  const tempV = useRef(new THREE.Vector3());

  useFrame(() => {
    const { alpha = 0, beta = 0, gamma = 0 } = orientation;

    // 1. Device orientation → quaternion
    euler.set(beta, alpha, -gamma, "YXZ");
    qDevice.setFromEuler(euler);

    // 2. Bridge sensor frame ↔ camera frame (-90° around X)
    qDevice.multiply(qScreen);

    // 3. Compass offset
    const headingDeg = trueHeading ?? magHeading;
    if (headingDeg != null) {
      forward.set(0, 0, -1).applyQuaternion(qDevice);
      const currentYaw = Math.atan2(-forward.x, -forward.z);
      const compassRad = (headingDeg * Math.PI) / 180;
      const desired = -compassRad - currentYaw;

      if (offsetRef.current === null) {
        offsetRef.current = desired;
      } else {
        let err = desired - offsetRef.current;
        err = Math.atan2(Math.sin(err), Math.cos(err));
        offsetRef.current += err * 0.02;
      }
    }

    // 4. Apply world-Y compass rotation
    qCompass.setFromAxisAngle(yAxis, offsetRef.current ?? 0);
    camera.quaternion.copy(qCompass).multiply(qDevice);

    // 5. Project the 3D signposts to 2D screen coordinates
    const projected = BAGUA_SECTORS.map((sector) => {
      const rad = (sector.angle * Math.PI) / 180;
      const x = Math.sin(rad) * RADIUS;
      const z = -Math.cos(rad) * RADIUS;

      // Set the 3D position and project it to Normalized Device Coordinates (-1 to 1)
      tempV.current.set(x, 0, z);
      tempV.current.project(camera);

      // Convert to actual pixel coordinates on the screen
      return {
        ...sector,
        screenX: (tempV.current.x * 0.5 + 0.5) * SCREEN_WIDTH,
        screenY: (-tempV.current.y * 0.5 + 0.5) * SCREEN_HEIGHT,
        // visible is false if the signpost is behind the camera
        visible: tempV.current.z < 1 && tempV.current.z > -1,
      };
    });

    onProject(projected);
  });

  return (
    <mesh
      scale={[-1, 1, 1]}
      rotation-y={(PANO_NORTH_OFFSET_DEG * Math.PI) / 180}
    >
      <sphereGeometry args={[5, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export default function PanoramaViewer() {
  const {
    orientation,
    permission: motionPermission,
    askPermission: askMotion,
  } = useDeviceOrientation();

  const {
    trueHeading,
    magHeading,
    permission: headingPermission,
    askPermission: askHeading,
  } = useHeading();

  // State to hold the projected 2D coordinates
  const [signposts, setSignposts] = useState([]);
  const ready = motionPermission === "granted";

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          if (gl && gl.debug) {
            gl.debug.checkShaderErrors = false;
          }
        }}
      >
        <PanoramaScene
          orientation={orientation}
          trueHeading={trueHeading}
          magHeading={magHeading}
          onProject={setSignposts} // Pass the state setter to the 3D scene
        />
      </Canvas>

      {/* 2D Text Overlays projected onto the 3D scene */}
      {signposts.map(
        (post) =>
          post.visible && (
            <View
              key={post.dir}
              style={[
                styles.signpost,
                {
                  left: post.screenX - 50, // Offset by half the width to center
                  top: post.screenY - 30, // Offset by half the height to center
                },
              ]}
              pointerEvents="none" // Let touches pass through to the canvas/UI
            >
              <Text style={[styles.signpostTrigram, { color: post.color }]}>
                {post.trigram}
              </Text>
              <Text style={styles.signpostDir}>{post.dir}</Text>
              <Text style={styles.signpostElement}>{post.element}</Text>
            </View>
          ),
      )}

      {!ready && (
        <View style={styles.overlay}>
          <Text style={styles.label}>Motion: {motionPermission}</Text>
          <Text style={styles.label}>Compass: {headingPermission}</Text>
          <Pressable style={styles.button} onPress={askMotion}>
            <Text style={styles.buttonText}>Enable Motion</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.buttonSecondary]}
            onPress={askHeading}
          >
            <Text style={styles.buttonText}>Enable Compass</Text>
          </Pressable>
        </View>
      )}

      {ready && (
        <View style={styles.hud} pointerEvents="none">
          <Text style={styles.hudText}>
            H: {trueHeading?.toFixed(1) ?? magHeading?.toFixed(1) ?? "—"}° | α:{" "}
            {orientation.alpha.toFixed(2)} | β: {orientation.beta.toFixed(2)} |
            γ: {orientation.gamma.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  label: { color: "#fff", fontSize: 14, fontVariant: ["tabular-nums"] },
  button: {
    backgroundColor: "#333",
    paddingVertical: 62,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonSecondary: { backgroundColor: "#555" },
  buttonText: { color: "#fff", fontSize: 16 },
  hud: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  hudText: {
    color: "#fff",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  // Styles for the 2D projected signposts
  signpost: {
    position: "absolute",
    width: 100, // Fixed width so we can center it easily
    alignItems: "center",
    justifyContent: "center",
  },
  signpostTrigram: {
    fontSize: 40,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  signpostDir: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  signpostElement: {
    fontSize: 14,
    color: "#ddd",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
