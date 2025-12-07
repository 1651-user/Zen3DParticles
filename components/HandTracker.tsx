import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, HandLandmarkerResult } from "@mediapipe/tasks-vision";
import { InteractionState } from '../types';
import { Camera, RefreshCw, Hand, Info } from 'lucide-react';

interface HandTrackerProps {
  onUpdate: (state: InteractionState) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  // Keep track of the landmarker instance
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        
        setIsReady(true);
        startCamera();
      } catch (err) {
        console.error("Failed to load MediaPipe:", err);
        setError("Could not load hand tracking. Falling back to mouse simulation.");
      }
    };

    initHandLandmarker();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(requestRef.current!);
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener('loadeddata', predictWebcam);
    } catch (err) {
      console.error("Camera denied:", err);
      setError("Camera access denied. Use mouse interaction.");
    }
  };

  const predictWebcam = () => {
    if (!landmarkerRef.current || !videoRef.current) return;

    const startTimeMs = performance.now();
    let result: HandLandmarkerResult | null = null;
    
    try {
       result = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
    } catch (e) {
      // Ignore transient errors
    }

    if (result && result.landmarks) {
      processLandmarks(result.landmarks);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const processLandmarks = (landmarks: any[][]) => {
    let tension = 0.5;
    let scale = 1.0;
    
    if (landmarks.length > 0) {
      // 1. Calculate Openness (Tension)
      // Use average distance between wrist (0) and finger tips (4,8,12,16,20)
      let totalOpenness = 0;
      
      landmarks.forEach(hand => {
        const wrist = hand[0];
        const tips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky
        let handOpenness = 0;
        
        tips.forEach(tipIdx => {
          const tip = hand[tipIdx];
          const dist = Math.sqrt(
            Math.pow(tip.x - wrist.x, 2) + 
            Math.pow(tip.y - wrist.y, 2)
          );
          handOpenness += dist;
        });
        // Normalize roughly: 0.1 (closed) to 0.4 (open) -> map to 0-1
        totalOpenness += Math.min(Math.max((handOpenness / 5 - 0.05) * 4, 0), 1);
      });

      tension = totalOpenness / landmarks.length;

      // 2. Calculate Scale (Distance between hands)
      if (landmarks.length === 2) {
        const wrist1 = landmarks[0][0];
        const wrist2 = landmarks[1][0];
        const dist = Math.sqrt(
            Math.pow(wrist1.x - wrist2.x, 2) + 
            Math.pow(wrist1.y - wrist2.y, 2)
        );
        // Map distance (0.1 to 0.8) to scale (0.5 to 3)
        scale = Math.min(Math.max(dist * 4, 0.5), 3.0);
      }
    }

    onUpdate({ tension, scale, isActive: landmarks.length > 0 });
  };

  // Fallback Mouse Handler
  useEffect(() => {
    if (error || !isActive) {
        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            onUpdate({
                tension: 1 - y, // Top of screen = open, bottom = closed
                scale: 0.5 + (x * 2.5), // Left = small, Right = big
                isActive: false // Mouse mode
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [error, isActive, onUpdate]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <div className="bg-gray-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-2xl mb-2 pointer-events-auto transition-opacity duration-300 hover:opacity-100 opacity-80">
        <div className="flex items-center gap-2 mb-2 text-white/90 font-medium">
          <Camera size={16} className="text-blue-400"/>
          <span className="text-xs uppercase tracking-wider">Vision Control</span>
        </div>
        
        <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden border border-white/5">
            {error ? (
                <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                    <span className="text-[10px] text-red-400">{error}</span>
                </div>
            ) : (
                <video 
                    ref={videoRef} 
                    className="absolute inset-0 w-full h-full object-cover mirror transform scale-x-[-1]" 
                    autoPlay 
                    playsInline 
                    muted
                />
            )}
            {!isReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <RefreshCw className="animate-spin text-white/50" size={16}/>
                </div>
            )}
        </div>
        <div className="mt-2 text-[10px] text-white/50 flex flex-col gap-1">
             <div className="flex items-center gap-1">
                <Hand size={10} />
                <span>Open/Close hands: Expand</span>
             </div>
             <div className="flex items-center gap-1">
                <span className="text-lg leading-none">↔</span>
                <span>Distance: Scale</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default HandTracker;
