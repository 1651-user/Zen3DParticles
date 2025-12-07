import React, { useState } from 'react';
import { ShapeType } from '../types';
import { Palette, Sparkles, BrainCircuit, Activity, Heart, Flower, Globe } from 'lucide-react';

interface UIProps {
  currentShape: ShapeType;
  currentColor: string;
  onShapeChange: (shape: ShapeType) => void;
  onColorChange: (color: string) => void;
  onGenerateAI: (prompt: string) => void;
  isGenerating: boolean;
}

const UI: React.FC<UIProps> = ({ 
  currentShape, 
  currentColor, 
  onShapeChange, 
  onColorChange,
  onGenerateAI,
  isGenerating
}) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);

  const shapes = [
    { type: ShapeType.HEART, icon: Heart, label: "Heart" },
    { type: ShapeType.FLOWER, icon: Flower, label: "Flower" },
    { type: ShapeType.SATURN, icon: Globe, label: "Saturn" },
    { type: ShapeType.FIREWORKS, icon: Sparkles, label: "Fireworks" },
  ];

  const colors = [
    '#FF3366', // Pink
    '#33CCFF', // Blue
    '#FFCC33', // Gold
    '#33FF99', // Green
    '#CC33FF', // Purple
    '#FFFFFF', // White
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-40">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            ZenParticles
          </h1>
          <p className="text-white/60 text-xs mt-1 max-w-[200px]">
            Use your hands or mouse to control the energy field.
          </p>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col gap-4 items-start pointer-events-auto">
        
        {/* Shape Selector */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-64">
          <div className="flex items-center gap-2 mb-3 text-white/80">
            <Activity size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">Templates</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {shapes.map((shape) => (
              <button
                key={shape.type}
                onClick={() => onShapeChange(shape.type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                  currentShape === shape.type 
                    ? 'bg-white text-black font-bold shadow-lg shadow-white/20' 
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <shape.icon size={14} />
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI Generator */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-64">
          <div className="flex items-center justify-between mb-3 text-white/80">
            <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-purple-400" />
                <span className="text-sm font-semibold uppercase tracking-wider">Gemini AI</span>
            </div>
            {currentShape === ShapeType.BUDDHA && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">Active</span>}
          </div>
          
          {!showAiInput ? (
            <div className="flex flex-col gap-2">
               <button
                onClick={() => {
                    onShapeChange(ShapeType.BUDDHA);
                    onGenerateAI("Buddha Statue");
                }}
                disabled={isGenerating}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-purple-500/30
                  ${currentShape === ShapeType.BUDDHA 
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-purple-500/10 text-purple-200 hover:bg-purple-500/20'
                  }`}
              >
                {isGenerating && currentShape === ShapeType.BUDDHA ? "Generating..." : "Load Buddha"}
              </button>
              <button 
                onClick={() => setShowAiInput(true)}
                className="text-xs text-white/40 hover:text-white underline text-center mt-1"
              >
                Generate Custom Shape
              </button>
            </div>
          ) : (
             <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2">
                <input 
                    type="text" 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Dragon, Chair..."
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAiInput(false)}
                        className="flex-1 py-1.5 rounded bg-white/5 text-xs text-white/60 hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            if (customPrompt) {
                                onGenerateAI(customPrompt);
                                onShapeChange(ShapeType.CUSTOM);
                                setShowAiInput(false);
                            }
                        }}
                        disabled={isGenerating || !customPrompt}
                        className="flex-1 py-1.5 rounded bg-purple-500 text-xs font-bold text-white hover:bg-purple-600 disabled:opacity-50"
                    >
                        {isGenerating ? "..." : "Generate"}
                    </button>
                </div>
             </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl w-64">
          <div className="flex items-center gap-2 mb-3 text-white/80">
            <Palette size={16} />
            <span className="text-sm font-semibold uppercase tracking-wider">Color</span>
          </div>
          <div className="flex gap-2 justify-between">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => onColorChange(c)}
                className={`w-6 h-6 rounded-full transition-transform duration-200 ${
                  currentColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}40` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UI;
