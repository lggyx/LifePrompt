import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ArticleSatellite({ article, parentPosition, index, total, theme, onClick }) {
  const meshRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isNight = theme === 'night';

  // 计算卫星位置（围绕父标签）
  const satellitePos = useMemo(() => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 2.5;
    return [
      parentPosition[0] + Math.cos(angle) * radius,
      parentPosition[1] + Math.sin(angle * 0.5) * 1.5,
      parentPosition[2] + Math.sin(angle) * radius,
    ];
  }, [index, total, parentPosition]);

  // 浮动动画
  useFrame((state) => {
    if (meshRef.current) {
      const float = Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.position.y = satellitePos[1] + float;
      // 缓慢自转
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.002;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(article);
  };

  // 根据文章内容长度决定大小
  const size = Math.min(0.5, 0.3 + (article.summary?.length || 0) / 1000 * 0.2);

  return (
    <group position={satellitePos}>
      {/* 文章节点 - 立方体 */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setIsHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={isHovered ? size * 1.3 : size}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={isNight ? '#ffffff' : '#191c1d'}
          transparent
          opacity={isNight ? 0.9 : 0.7}
        />
      </mesh>

      {/* 发光边框（夜间/悬停） */}
      {(isNight || isHovered) && (
        <mesh scale={size * 1.1}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            color={isNight ? '#00ffcc' : '#00f0ff'}
            transparent
            opacity={isHovered ? 0.5 : 0.2}
            blending={THREE.AdditiveBlending}
            wireframe
          />
        </mesh>
      )}

      {/* 悬停时的预览卡片 */}
      <AnimatePresence>
        {isHovered && (
          <Html
            position={[0, 1.2, 0]}
            center
            distanceFactor={8}
            style={{
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              style={{
                width: '200px',
                background: isNight
                  ? 'rgba(19, 19, 32, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${isNight ? 'rgba(0, 255, 204, 0.3)' : 'rgba(0, 111, 112, 0.2)'}`,
                borderRadius: '12px',
                padding: '12px',
                boxShadow: isNight
                  ? '0 0 20px rgba(0, 255, 204, 0.2)'
                  : '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h4 style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 600,
                color: isNight ? '#e0e0f0' : '#191c1d',
                lineHeight: 1.3,
              }}>
                {article.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: isNight ? '#9ca3af' : '#6a7a7b',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {article.summary}
              </p>
              <div style={{
                marginTop: '8px',
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
              }}>
                {article.tags?.slice(0, 2).map((tag, i) => (
                  <span key={i} style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: isNight ? 'rgba(255, 45, 120, 0.2)' : 'rgba(0, 240, 255, 0.2)',
                    color: isNight ? '#ff2d78' : '#006970',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </Html>
        )}
      </AnimatePresence>
    </group>
  );
}
