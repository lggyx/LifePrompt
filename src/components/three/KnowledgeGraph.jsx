import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

import { ThreeCanvas } from './ThreeCanvas';
import { CoreNode } from './CoreNode';
import { TagOrbit } from './TagOrbit';
import { ArticleSatellite } from './ArticleSatellite';
import { ConnectionLines } from './ConnectionLines';
import { DashboardHUD } from './DashboardHUD';

// 默认标签配置
const DEFAULT_TAGS = ['知识管理', 'AI', '效率', '写作', '学习'];

// 颜色映射
const TAG_COLORS = {
  '知识管理': { light: '#00f0ff', night: '#00ffcc' },
  'AI': { light: '#d300bd', night: '#ff2d78' },
  '效率': { light: '#a2ef00', night: '#ffe04a' },
  '写作': { light: '#006970', night: '#00ffcc' },
  '学习': { light: '#a90097', night: '#ff2d78' },
};

export function KnowledgeGraph({ articles, tags, theme, onArticleClick, onTagClick }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const [selectedTag, setSelectedTag] = useState(null);

  const isNight = theme === 'night';

  // 生成节点数据
  const nodes = useMemo(() => {
    const nodeList = [];

    // 核心节点
    nodeList.push({
      id: 'root',
      type: 'core',
      position: [0, 0, 0],
      color: isNight ? '#ff2d78' : '#00f0ff',
    });

    // 标签节点
    const activeTags = tags.length > 0 ? tags : DEFAULT_TAGS.map((name) => ({ name }));
    activeTags.forEach((tag, i) => {
      const angle = (i / activeTags.length) * Math.PI * 2;
      const radius = 6 + (i % 2) * 2;
      const position = [
        Math.cos(angle) * radius,
        Math.sin(i * 0.5) * 2,
        Math.sin(angle) * radius,
      ];

      nodeList.push({
        id: `tag-${tag.name}`,
        type: 'tag',
        name: tag.name,
        position,
        parent: 'root',
        color: TAG_COLORS[tag.name]?.[isNight ? 'night' : 'light'] || (isNight ? '#ff2d78' : '#00f0ff'),
      });
    });

    // 文章节点
    articles.forEach((article, i) => {
      const tagName = article.tags?.[0] || activeTags[0]?.name || '知识管理';
      const tagNode = nodeList.find((n) => n.type === 'tag' && n.name === tagName);

      if (tagNode) {
        const articleIndex = articles.filter((a) => a.tags?.includes(tagName)).indexOf(article);
        const totalInTag = articles.filter((a) => a.tags?.includes(tagName)).length;

        const angle = (articleIndex / Math.max(totalInTag, 1)) * Math.PI * 2;
        const radius = 2.5;

        nodeList.push({
          id: `article-${article.id}`,
          type: 'article',
          article,
          position: [
            tagNode.position[0] + Math.cos(angle) * radius,
            tagNode.position[1] + Math.sin(articleIndex * 0.5) * 1,
            tagNode.position[2] + Math.sin(angle) * radius,
          ],
          parent: `tag-${tagName}`,
          color: isNight ? '#ffffff' : '#191c1d',
        });
      }
    });

    return nodeList;
  }, [articles, tags, isNight]);

  // 相机入场动画
  useEffect(() => {
    const startPos = new THREE.Vector3(0, 0, 30);
    const endPos = new THREE.Vector3(0, 5, 18);

    let progress = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPos, endPos, eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [camera]);

  // 处理标签点击
  const handleTagClick = (tagName) => {
    setSelectedTag(tagName);
    onTagClick?.(tagName);

    // 相机移动到标签前方
    const tagNode = nodes.find((n) => n.type === 'tag' && n.name === tagName);
    if (tagNode && controlsRef.current) {
      const targetPos = new THREE.Vector3(
        tagNode.position[0] + 5,
        tagNode.position[1] + 2,
        tagNode.position[2] + 5
      );

      controlsRef.current.setLookAt(
        targetPos.x, targetPos.y, targetPos.z,
        tagNode.position[0], tagNode.position[1], tagNode.position[2],
        true
      );
    }
  };

  return (
    <>
      {/* 星空背景（夜间模式） */}
      {isNight && (
        <Stars
          radius={100}
          depth={50}
          count={500}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
      )}

      {/* 中心节点 */}
      <CoreNode theme={theme} scale={isNight ? 1.5 : 1.2} />

      {/* 标签轨道 */}
      {nodes
        .filter((n) => n.type === 'tag')
        .map((tagNode, i) => {
          const tagArticles = articles.filter((a) => a.tags?.includes(tagNode.name));
          return (
            <TagOrbit
              key={tagNode.id}
              tag={tagNode.name}
              position={(i / nodes.filter((n) => n.type === 'tag').length) * Math.PI * 2}
              orbitRadius={Math.sqrt(tagNode.position[0] ** 2 + tagNode.position[2] ** 2)}
              orbitSpeed={0.1 + i * 0.02}
              theme={theme}
              onClick={handleTagClick}
              articleCount={tagArticles.length}
            />
          );
        })}

      {/* 文章卫星 */}
      {nodes
        .filter((n) => n.type === 'article')
        .map((articleNode, i) => {
          const parentNode = nodes.find((n) => n.id === articleNode.parent);
          const siblings = nodes.filter((n) => n.parent === articleNode.parent && n.type === 'article');
          const index = siblings.findIndex((n) => n.id === articleNode.id);

          return (
            <ArticleSatellite
              key={articleNode.id}
              article={articleNode.article}
              parentPosition={parentNode?.position || [0, 0, 0]}
              index={index}
              total={siblings.length}
              theme={theme}
              onClick={onArticleClick}
            />
          );
        })}

      {/* 连线 */}
      <ConnectionLines nodes={nodes} theme={theme} />

      {/* 轨道控制器 */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={40}
        autoRotate={!selectedTag}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}
