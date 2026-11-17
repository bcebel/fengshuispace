import { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
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



// Pre-allocated math objects — avoids GC churn every frame
const euler = new THREE.Euler();
const qDevice = new THREE.Quaternion();
const qScreen = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -90° around X
const qCompass = new THREE.Quaternion();
const yAxis = new THREE.Vector3(0, 1, 0);
const forward = new THREE.Vector3();

const PANO_NORTH_OFFSET_DEG = 157.5;

function PanoramaScene({ orientation, trueHeading, magHeading }) {
  const { camera } = useThree();
  const texture = useLoader(TextureLoader, PANO_URL);
  const offsetRef = useRef(null);

  useFrame(() => {
    const { alpha = 0, beta = 0, gamma = 0 } = orientation;

    // 1. Device orientation → quaternion
    //    W3C spec is intrinsic Z-X'-Y''; three.js 'YXZ' matches it.
    //    Negate gamma because the W3C frame is left-handed for roll.
    euler.set(beta, alpha, -gamma, "YXZ");
    qDevice.setFromEuler(euler);

    // 2. Bridge sensor frame ↔ camera frame.
    //    Camera looks down -Z; phone's "forward" is out the back, which is
    //    already -Z, but the phone's flat plane is +Y. The -90° X rotation
    //    aligns "hold phone upright" with "look at horizon".
    qDevice.multiply(qScreen);

    // 3. Compass offset: extract current camera yaw (project forward to XZ),
    //    compare against compass heading, converge slowly.
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

    // 4. Apply world-Y compass rotation (premultiply rotates in world space,
    //    so it does NOT tilt the camera's pitch or roll).
    qCompass.setFromAxisAngle(yAxis, offsetRef.current ?? 0);
    camera.quaternion.copy(qCompass).multiply(qDevice);
  });

  return (
    // scale={[-1, 1, 1]} un-mirrors the panorama text.
    // If the sphere turns invisible, change side={THREE.BackSide} to
    // side={THREE.FrontSide} — the X-flip reverses face winding.
    /*  
        <mesh position={[0, 0, -4.9]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            map={texture}
            side={THREE.BackSide}
            transparent
            opacity={0.4}
          />
        </mesh>*/
    <>
      <>
        <mesh
          scale={[-1, 1, 1]}
          rotation-y={(PANO_NORTH_OFFSET_DEG * Math.PI) / 180}
        >
          <sphereGeometry args={[5, 64, 64]} />
          <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>


      </>
    </>
  );
}

export default function PanoramaViewer() {
  const {
    orientation,
    permission: motionPermission,
    askPermission: askMotion,
  } = useDeviceOrientation();

  // console.log("orientation", orientation);
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
