import ExpoTHREE from "expo-three";
import {THREE} from "expo-three";
import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as DeviceMotion from "expo-sensors";
import { OrbitControls } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";

function InsideSphere() {
  const ref = useRef<THREE.Mesh>(null!);
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const [heading, setHeading] = useState(0); // Cardinal direction
  const [permissionState, setPermissionState] = useState("unknown");

  const texture = useLoader(
    THREE.TextureLoader,
    "https://minnowspace.com/fs.png"
  );

  useEffect(() => {
    const handleMotion = (event: DeviceMotion.DeviceMotionMeasurement) => {
      const { rotation } = event;
      if (rotation) {
        setOrientation({
          alpha: rotation.alpha * (Math.PI / 180),
          beta: rotation.beta * (Math.PI / 180),
          gamma: rotation.gamma * (Math.PI / 180),
        });

        // Assuming heading can be derived from alpha
        setHeading(rotation.alpha); // Update heading
      }
    };

    // Request motion permission
    const requestMotionPermission = async () => {
      try {
        if (
          typeof DeviceMotion !== "undefined" &&
          typeof DeviceMotion.requestPermissionsAsync === "function"
        ) {
          const permission = await DeviceMotion.requestPermissionsAsync();
          setPermissionState(permission);
          if (permission.status === "granted") {
            DeviceMotion.addListener(handleMotion);
          }
        } else {
          setPermissionState("granted");
          DeviceMotion.addListener(handleMotion);
        }
      } catch (error) {
        console.error("Error requesting motion permission:", error);
        setPermissionState("error");
      }
    };

    requestMotionPermission();

    return () => {
      DeviceMotion.removeListener(handleMotion);
    };
  }, []);

  useFrame(() => {
    if (ref.current) {
      const euler = new THREE.Euler(
        orientation.alpha,
        orientation.beta,
        orientation.gamma
      );
      ref.current.rotation.copy(euler);
      ref.current.rotation.y = THREE.MathUtils.lerp(
        ref.current.rotation.y,
        heading * (Math.PI / 180),
        0.1
      );
    }
  });

  useEffect(() => {
    const debugDiv = document.createElement("div");
    debugDiv.style.position = "fixed";
    debugDiv.style.bottom = "10px";
    debugDiv.style.left = "10px";
    debugDiv.style.backgroundColor = "rgba(0,0,0,0.7)";
    debugDiv.style.color = "white";
    debugDiv.style.padding = "10px";
    debugDiv.style.fontFamily = "monospace";
    debugDiv.style.zIndex = "1000";
    document.body.appendChild(debugDiv);

    const updateDebug = () => {
      debugDiv.innerHTML = `
        Permission: ${permissionState}<br>
        Heading: ${heading.toFixed(2)}°<br>
        Alpha: ${orientation.alpha.toFixed(2)}<br>
        Beta: ${orientation.beta.toFixed(2)}<br>
        Gamma: ${orientation.gamma.toFixed(2)}
      `;
    };

    const interval = setInterval(updateDebug, 100);

    return () => {
      clearInterval(interval);
      document.body.removeChild(debugDiv);
    };
  }, [orientation, heading, permissionState]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[5, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide} // Correct to render inside sphere properly
        transparent={true}
      />
    </mesh>
  );
}

export default function Zapp() {
  return (
    <Canvas camera={{ position: [0, 0, 0.1], near: 0.1, far: 100, fov: 75 }}>
      <InsideSphere />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
