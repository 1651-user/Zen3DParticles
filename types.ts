export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  FIREWORKS = 'Fireworks',
  BUDDHA = 'Buddha (AI)',
  CUSTOM = 'Custom AI',
}

export interface InteractionState {
  tension: number; // 0 to 1 (Hand closed to open)
  scale: number;   // 0.5 to 3 (Distance between hands)
  isActive: boolean;
}

export interface ParticleConfig {
  color: string;
  pointCount: number;
  shapeType: ShapeType;
  customPrompt?: string;
}

export type Vector3Array = Float32Array;
