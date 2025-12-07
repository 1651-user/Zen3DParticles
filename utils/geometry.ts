import * as THREE from 'three';

// Helper to get random point in sphere
const randomInSphere = () => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random());
  const sinPhi = Math.sin(phi);
  return {
    x: r * sinPhi * Math.cos(theta),
    y: r * sinPhi * Math.sin(theta),
    z: r * Math.cos(phi),
  };
};

export const generateHeart = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    // Heart curve variation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    // Add some volume/noise
    const noise = randomInSphere();
    const spread = 0.5;

    positions[i * 3] = (x + noise.x * spread) * 0.1;
    positions[i * 3 + 1] = (y + noise.y * spread) * 0.1;
    positions[i * 3 + 2] = noise.z * 2;
  }
  return positions;
};

export const generateSaturn = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const ringCount = Math.floor(count * 0.7);
  const sphereCount = count - ringCount;

  // Sphere
  for (let i = 0; i < sphereCount; i++) {
    const p = randomInSphere();
    positions[i * 3] = p.x * 1.5;
    positions[i * 3 + 1] = p.y * 1.5;
    positions[i * 3 + 2] = p.z * 1.5;
  }

  // Rings
  for (let i = sphereCount; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 2.5 + Math.random() * 2;
    const wobble = (Math.random() - 0.5) * 0.1;
    
    positions[i * 3] = Math.cos(angle) * dist;
    positions[i * 3 + 1] = wobble;
    positions[i * 3 + 2] = Math.sin(angle) * dist;
  }
  return positions;
};

export const generateFlower = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2; // angle
    const v = Math.random(); // radius
    
    // 5 petals formula
    const r = Math.sin(5 * u) * 2 + 3;
    const finalR = r * v;

    const x = Math.cos(u) * finalR;
    const y = Math.sin(u) * finalR;
    const z = (Math.random() - 0.5) * 2 * (1 - v); // thicker at center

    positions[i * 3] = x * 0.5;
    positions[i * 3 + 1] = y * 0.5;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

export const generateFireworks = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = randomInSphere();
    const burst = Math.random() > 0.9 ? 3 : 1; // Some outliers
    positions[i * 3] = p.x * 3 * burst;
    positions[i * 3 + 1] = p.y * 3 * burst;
    positions[i * 3 + 2] = p.z * 3 * burst;
  }
  return positions;
};

// Fallback sphere if AI fails
export const generateSphere = (count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = randomInSphere();
    positions[i * 3] = p.x * 2;
    positions[i * 3 + 1] = p.y * 2;
    positions[i * 3 + 2] = p.z * 2;
  }
  return positions;
};
