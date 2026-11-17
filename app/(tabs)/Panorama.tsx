import { useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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

const PANO_URL = "https://minnowspace.com/fs.png";

function PanoramaScene({ orientation, trueHeading, magHeading }) {
  const { camera } = useThree();
  const texture = useLoader(TextureLoader, PANO_URL);
  const offsetRef = useRef(null);

  useFrame(() => {
    const headingDeg = trueHeading ?? magHeading;
    const compassRad = headingDeg != null ? (headingDeg * Math.PI) / 180 : null;

    // Lock the alpha→true-north offset on the first compass sample, then
    // gently converge it over time. This keeps yaw = alpha − offset equal
    // to true north even when DeviceMotion.alpha drifts.
    if (compassRad !== null) {
      const desired = orientation.alpha - compassRad;
      if (offsetRef.current === null) {
        offsetRef.current = desired;
      } else {
        let err = desired - offsetRef.current;
        err = Math.atan2(Math.sin(err), Math.cos(err));
        offsetRef.current += err * 0.02;
      }
    }

    const yaw = orientation.alpha - (offsetRef.current ?? 0);

    camera.rotation.set(
      orientation.beta, // pitch: look up/down
      yaw, // yaw: north-anchored
      -orientation.gamma, // roll: may need sign flip per device
      "YXZ",
    );
  });

  return (
    <mesh>
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

  const ready = motionPermission === "granted";

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          gl.debug.checkShaderErrors = false;
        }}
      >
        <PanoramaScene
          orientation={orientation}
          trueHeading={trueHeading}
          magHeading={magHeading}
        />
      </Canvas>

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
});
