import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';

export function ThreeCanvas({ children, theme }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: theme === 'night'
            ? 'linear-gradient(180deg, #0a0a12, #131320)'
            : 'linear-gradient(180deg, #f8f9fa, #edeeef)',
        }}
      />
    );
  }

  const isNight = theme === 'night';

  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      style={{
        background: isNight
          ? 'linear-gradient(180deg, #0a0a12, #131320)'
          : 'linear-gradient(180deg, #f8f9fa, #edeeef)',
      }}
    >
      {/* 环境光 */}
      <ambientLight intensity={isNight ? 0.3 : 0.6} />

      {/* 主光源 */}
      <pointLight
        position={[10, 10, 10]}
        intensity={isNight ? 1.5 : 1}
        color={isNight ? '#ff2d78' : '#00f0ff'}
      />

      {/* 补光 */}
      <pointLight
        position={[-10, -10, -5]}
        intensity={0.5}
        color={isNight ? '#00ffcc' : '#d300bd'}
      />

      {/* 雾效果 */}
      <fog
        attach="fog"
        args={[isNight ? '#0a0a12' : '#f8f9fa', 10, 30]}
      />

      {children}
    </Canvas>
  );
}
