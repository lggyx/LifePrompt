import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ConnectionLines({ nodes, theme }) {
  const lineRef = useRef();
  const isNight = theme === 'night';

  // 生成连线位置
  const positions = useMemo(() => {
    const positions = [];
    const colors = [];

    nodes.forEach((node) => {
      if (node.parent && node.position) {
        const parentNode = nodes.find((n) => n.id === node.parent);
        if (parentNode && parentNode.position) {
          // 起点
          positions.push(...parentNode.position);
          // 终点
          positions.push(...node.position);

          // 颜色
          const color = new THREE.Color(node.color || (isNight ? '#ff2d78' : '#00f0ff'));
          colors.push(color.r, color.g, color.b);
          colors.push(color.r, color.g, color.b);
        }
      }
    });

    return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
  }, [nodes, isNight]);

  // 夜间模式：脉冲动画
  useFrame((state) => {
    if (lineRef.current && isNight) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      lineRef.current.material.opacity = pulse * 0.6;
    }
  });

  if (positions.positions.length === 0) return null;

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.positions.length / 3}
          array={positions.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={positions.colors.length / 3}
          array={positions.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={isNight ? 0.6 : 0.3}
        blending={isNight ? THREE.AdditiveBlending : THREE.NormalBlending}
        linewidth={isNight ? 2 : 1}
      />
    </lineSegments>
  );
}

// 更华丽的连线组件（带曲线）
export function CurvedConnection({ start, end, color, theme, animated = false }) {
  const curveRef = useRef();
  const isNight = theme === 'night';

  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    const midPoint = startVec.clone().lerp(endVec, 0.5);
    midPoint.y += 1; // 弧形向上

    return new THREE.QuadraticBezierCurve3(startVec, midPoint, endVec);
  }, [start, end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);

  useFrame((state) => {
    if (animated && curveRef.current) {
      const offset = (state.clock.elapsedTime * 0.5) % 1;
      curveRef.current.material.dashOffset = -offset;
    }
  });

  return (
    <mesh>
      {/* 这里简化处理，实际应该用 TubeGeometry */}
      <line ref={curveRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={isNight ? 0.5 : 0.2}
          blending={isNight ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </line>
    </mesh>
  );
}
