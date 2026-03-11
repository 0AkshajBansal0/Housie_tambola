import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const NeonGrid = ({ spacing = 6.2, duration = 25 }) => {

  const verticalRefs = useRef([]);
  const horizontalRefs = useRef([]);

  const cols = 10;
  const rows = 9;

  const startX = -(spacing * (cols - 1)) / 2;
  const startZ = -(spacing * (rows - 1)) / 2;

  const gap = spacing / 2;

  const vertical = useMemo(() => {

    const arr = [];

    for (let i = 0; i < cols - 1; i++) {

      const x = startX + i * spacing + gap;

      arr.push([
        new THREE.Vector3(x, 0.25, startZ - gap),
        new THREE.Vector3(x, 0.25, startZ + (rows - 1) * spacing + gap)
      ]);

    }

    return arr;

  }, []);

  const horizontal = useMemo(() => {

    const arr = [];

    for (let j = 0; j < rows - 1; j++) {

      const z = startZ + j * spacing + gap;

      arr.push([
        new THREE.Vector3(startX + (cols - 1) * spacing + gap, 0.25, z),
        new THREE.Vector3(startX - gap, 0.25, z)
      ]);

    }

    return arr;

  }, []);

  const startTime = useRef(null);

  useFrame(({ clock }) => {

    if (startTime.current === null)
      startTime.current = clock.getElapsedTime();

    const elapsed = clock.getElapsedTime() - startTime.current;

    const progress = Math.min(elapsed / duration, 1);

    const totalLines = vertical.length + horizontal.length;

    const activeLines = progress * totalLines;

    verticalRefs.current.forEach((line, i) => {

      if (!line) return;

      const draw = Math.min(activeLines - i, 1);

      line.scale.z = Math.max(draw, 0);

    });

    horizontalRefs.current.forEach((line, i) => {

      if (!line) return;

      const draw = Math.min(activeLines - vertical.length - i, 1);

      line.scale.x = Math.max(draw, 0);

    });

  });

  return (

    <group>

      {vertical.map((points, i) => {

        const geo = new THREE.BufferGeometry().setFromPoints(points);

        return (

          <group key={"v" + i} ref={(el) => (verticalRefs.current[i] = el)}>

            {/* glow layer */}
            <line geometry={geo}>
              <lineBasicMaterial
                color="#ff0044"
                transparent
                opacity={0.25}
                blending={THREE.AdditiveBlending}
              />
            </line>

            {/* core laser */}
            <line geometry={geo}>
              <lineBasicMaterial
                color="#ff0044"
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
              />
            </line>

          </group>

        );

      })}

      {horizontal.map((points, i) => {

        const geo = new THREE.BufferGeometry().setFromPoints(points);

        return (

          <group key={"h" + i} ref={(el) => (horizontalRefs.current[i] = el)}>

            {/* glow layer */}
            <line geometry={geo}>
              <lineBasicMaterial
                color="#ff003c"
                transparent
                opacity={0.25}
                blending={THREE.AdditiveBlending}
              />
            </line>

            {/* core laser */}
            <line geometry={geo}>
              <lineBasicMaterial
                color="#ff0044"
                transparent
                opacity={1}
                blending={THREE.AdditiveBlending}
              />
            </line>

          </group>

        );

      })}

    </group>

  );

};

export default NeonGrid;