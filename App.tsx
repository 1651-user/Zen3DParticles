import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ShapeType, InteractionState } from './types';
import ParticleSystem from './components/ParticleSystem';
import HandTracker from './components/HandTracker';
import UI from './components/UI';
import { generateAIShape } from './services/geminiService';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  const [customPoints, setCustomPoints] = useState<Float32Array | undefined>(undefined);
  const [color, setColor] = useState<string>('#FF3366');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [interaction, setInteraction] = useState<InteractionState>({
    tension: 0.5,
    scale: 1,
    isActive: false
  });

  const handleAIRequest = async (prompt: string) => {
    setIsGenerating(true);
    const points = await generateAIShape(prompt);
    if (points) {
      setCustomPoints(points);
      // Force update if we were already on a custom shape to trigger re-render
      if (currentShape === ShapeType.CUSTOM || currentShape === ShapeType.BUDDHA) {
          // This is a subtle react trick, but we might not need it if points reference changes
      }
    } else {
        alert("AI generation failed or API key missing. Check console.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <ParticleSystem 
            shapeType={currentShape} 
            customPoints={customPoints}
            color={color} 
            interaction={interaction}
          />
          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3}/>
          <Environment preset="city" />
        </Canvas>
      </div>

      {/* Hand Tracking Input (Camera) */}
      <HandTracker onUpdate={setInteraction} />

      {/* UI Overlay */}
      <UI 
        currentShape={currentShape}
        currentColor={color}
        onShapeChange={setCurrentShape}
        onColorChange={setColor}
        onGenerateAI={handleAIRequest}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default App;
