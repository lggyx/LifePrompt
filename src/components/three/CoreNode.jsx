import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CoreNode({ theme, scale = 2 }) {
  const meshRef = useRef();
  const glowRef = useRef();

  const isNight = theme === 'night';

  // 脉动动画
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.05 + 1;
      meshRef.current.scale.setScalar(scale * pulse);
    }
    if (glowRef.current) {
      const glowPulse = Math.sin(state.clock.elapsedTime * 1.5 + 0.5) * 0.1 + 1;
      glowRef.current.scale.setScalar(scale * 1.3 * glowPulse);
      glowRef.current.material.opacity = isNight ? 0.3 * glowPulse : 0.15 * glowPulse;
    }
  });

  // 发光材质颜色
  const coreColor = useMemo(() => {
    return isNight ? new THREE.Color('#ff2d78') : new THREE.Color('#00f0ff');
  }, [isNight]);

  const glowColor = useMemo(() => {
    return isNight ? new THREE.Color('#ff2d78') : new THREE.Color('#00dbe9');
  }, [isNight]);

  return (
    <group>
      {/* 核心球体 */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={isNight ? 0.9 : 0.7}
        />
      </mesh>

      {/* 外层发光 */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={isNight ? 0.3 : 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 内核心（更亮） */}
      <mesh position={[0, 0, 0]} scale={scale * 0.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={isNight ? '#ff5c97' : '#ffffff'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 夜间模式：额外发光环 */}
      {isNight && (
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[scale * 1.5, 0.02, 8, 64]} />
          <meshBasicMaterial
            color="#ff2d78"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}
