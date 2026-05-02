import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const TAG_COLORS = {
  '知识管理': { light: '#00f0ff', night: '#00ffcc' },
  'AI': { light: '#d300bd', night: '#ff2d78' },
  '效率': { light: '#a2ef00', night: '#ffe04a' },
  '写作': { light: '#006970', night: '#00ffcc' },
  '学习': { light: '#a90097', night: '#ff2d78' },
};

export function TagOrbit({ tag, position, orbitRadius, orbitSpeed, theme, onClick, articleCount }) {
  const groupRef = useRef();
  const meshRef = useRef();

  const isNight = theme === 'night';
  const color = TAG_COLORS[tag]?.[isNight ? 'night' : 'light'] || (isNight ? '#ff2d78' : '#00f0ff');

  // 轨道旋转动画
  useFrame((state) => {
    if (groupRef.current) {
      const angle = state.clock.elapsedTime * orbitSpeed + position;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius;
      groupRef.current.position.y = Math.sin(angle * 0.5) * 2; // 轻微上下浮动
    }
    // 自身旋转
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  const handleClick = () => {
    onClick?.(tag);
  };

  return (
    <group ref={groupRef}>
      {/* 标签节点球体 */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <icosahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isNight ? 0.8 : 0.6}
        />
      </mesh>

      {/* 发光外层 */}
      <mesh scale={1.2}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isNight ? 0.2 : 0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 标签名称 HTML */}
      <Html
        position={[0, 1.5, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: isNight
              ? 'rgba(10, 10, 18, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isNight ? 'rgba(255, 45, 120, 0.3)' : 'rgba(0, 111, 112, 0.2)'}`,
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: isNight ? color : '#006970',
            textShadow: isNight ? `0 0 8px ${color}` : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
          <span style={{
            marginLeft: '6px',
            opacity: 0.7,
            fontSize: '10px',
          }}>
            {articleCount}篇
          </span>
        </motion.div>
      </Html>

      {/* 轨道环线（夜间模式可见） */}
      {isNight && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[orbitRadius - 0.02, orbitRadius + 0.02, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
