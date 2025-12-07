import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType, InteractionState } from '../types';
import { 
    generateHeart, 
    generateFlower, 
    generateSaturn, 
    generateFireworks,
    generateSphere
} from '../utils/geometry';

interface ParticleSystemProps {
  shapeType: ShapeType;
  customPoints?: Float32Array;
  color: string;
  interaction: InteractionState;
}

const COUNT = 3000;

const ParticleSystem: React.FC<ParticleSystemProps> = ({ shapeType, customPoints, color, interaction }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Memoize geometry targets
  const targets = useMemo(() => {
    return {
        [ShapeType.HEART]: generateHeart(COUNT),
        [ShapeType.FLOWER]: generateFlower(COUNT),
        [ShapeType.SATURN]: generateSaturn(COUNT),
        [ShapeType.FIREWORKS]: generateFireworks(COUNT),
        [ShapeType.BUDDHA]: generateSphere(COUNT), // Placeholder if AI not loaded
        [ShapeType.CUSTOM]: generateSphere(COUNT), // Placeholder
    };
  }, []);

  // Current positions buffer
  const positions = useMemo(() => new Float32Array(COUNT * 3), []);
  // Initial random positions
  useMemo(() => {
      const start = generateFireworks(COUNT); // Start with explosion state
      for(let i=0; i<start.length; i++) positions[i] = start[i];
  }, [positions]);

  // Handle Geometry Updates
  const currentTarget = useMemo(() => {
      if (customPoints && (shapeType === ShapeType.BUDDHA || shapeType === ShapeType.CUSTOM)) {
          // If we have custom points from AI, use them
          // Resample if counts mismatch (simple truncation or padding)
          if (customPoints.length !== COUNT * 3) {
             const adjusted = new Float32Array(COUNT * 3);
             for(let i=0; i<COUNT*3; i++) {
                 adjusted[i] = customPoints[i % customPoints.length];
             }
             return adjusted;
          }
          return customPoints;
      }
      return targets[shapeType] || targets[ShapeType.FIREWORKS];
  }, [shapeType, customPoints, targets]);

  // Animation Loop
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    
    // Smooth interaction values
    const tensionFactor = interaction.tension; // 0 (tight) to 1 (exploded)
    const scaleFactor = interaction.scale;

    pointsRef.current.scale.setScalar(THREE.MathUtils.lerp(pointsRef.current.scale.x, scaleFactor, 0.1));
    pointsRef.current.rotation.y += 0.002 + (interaction.tension * 0.01);

    const positionsArray = positionAttribute.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        
        // Target coordinates
        const tx = currentTarget[i3];
        const ty = currentTarget[i3 + 1];
        const tz = currentTarget[i3 + 2];

        // Current coordinates
        let cx = positionsArray[i3];
        let cy = positionsArray[i3 + 1];
        let cz = positionsArray[i3 + 2];

        // "Breathing" / Tension effect
        // If tension is high (hands open), expand particles slightly outward from center
        // If tension is low (hands closed), pull tightly to target shape
        
        // Expansion vector from center
        const dist = Math.sqrt(cx*cx + cy*cy + cz*cz) || 1;
        const dirX = cx / dist;
        const dirY = cy / dist;
        const dirZ = cz / dist;

        // Dynamic Lerp speed
        const speed = 0.05;

        // Modify target based on tension
        // Tension 0 = Tight shape
        // Tension 1 = Exploded / Loose
        
        const explosionMod = tensionFactor * 3.0; 
        
        const targetX = tx + (dirX * explosionMod * Math.sin(state.clock.elapsedTime * 2 + i));
        const targetY = ty + (dirY * explosionMod * Math.cos(state.clock.elapsedTime * 2 + i));
        const targetZ = tz + (dirZ * explosionMod);

        // Update positions
        positionsArray[i3] = THREE.MathUtils.lerp(cx, targetX, speed);
        positionsArray[i3 + 1] = THREE.MathUtils.lerp(cy, targetY, speed);
        positionsArray[i3 + 2] = THREE.MathUtils.lerp(cz, targetZ, speed);
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={0.05}
        color={color}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default ParticleSystem;
