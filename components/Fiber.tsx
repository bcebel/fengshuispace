import * as THREE from "three";
import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { Canvas, useFrame, useThree, createPortal } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Viewcube() {
  const {
    gl,
    scene: defaultScene,
    camera: defaultCamera,
    size,
    events,
  } = useThree();
  const [scene] = useState(() => new THREE.Scene());
  const [camera] = useState(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, .0001,1000000)
  );

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    // Load the texture
    const loader = new THREE.TextureLoader();
    loader.load(
      "https://minnowspace.com/fs.png", // Replace with the path to your texture image
      (loadedTexture) => {
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );
  }, []);

  useLayoutEffect(() => {
    camera.left = -size.width / 2;
    camera.right = size.width / 2;
    camera.top = size.height / 2;
    camera.bottom = -size.height / 2;
    camera.position.set(0, 0, 100);
    camera.updateProjectionMatrix();
  }, [size]);

  const ref = useRef<THREE.Mesh>(null!);
  const [hover, set] = useState<number | null>(null);
  const matrix = new THREE.Matrix4();

  useFrame(() => {
    matrix.copy(defaultCamera.matrix).invert();
    ref.current.quaternion.setFromRotationMatrix(matrix);
    gl.autoClear = true;
    gl.render(defaultScene, defaultCamera);
    gl.autoClear = false;
    gl.clearDepth();
    gl.render(scene, camera);
  }, 1);

  return (
    <>
      {createPortal(
        <group>
          <mesh
            ref={ref}
            position={[size.width / 20 - 120, size.height / 2 - 120, 0]}
            onPointerOut={() => set(null)}
            onPointerMove={(e) => set(Math.floor((e.faceIndex || 0) / 2))}
          >
            <sphereGeometry args={[100, 52, 56]} />
            {texture ? (
              <meshBasicMaterial map={texture} />
            ) : (
              <meshLambertMaterial color="white" />
            )}
          </mesh>
          <ambientLight intensity={100.5} />
          <pointLight decay={100} position={[10, 10, 10]} intensity={10.5} />
        </group>,
        scene,
        { camera, events: { priority: events.priority + 1 } }
      )}
    </>
  );
}

export default function Zapp() {
  return (
    <Canvas>
      <mesh>
        <Viewcube />
        <OrbitControls />
      </mesh>
    </Canvas>
  );
}
