'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AssetSidebar } from './AssetSidebar';
import { PreviewPanel } from './PreviewPanel';
import { ControlPanel } from './ControlPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';

export type EffectType = 'ascii' | 'pixel';

export interface AppState {
  image: string | null;
  imageElement: HTMLImageElement | null;
  activeEffect: EffectType;
  asciiParams: {
    chars: string;
    fontSize: number;
    brightnessBoost: number;
    posterize: number;
    scale: number;
    parallax: number;
    enableParallax: boolean;
    enableGlitch: boolean;
    enableReveal: boolean;
    animationSpeed: number;
  };
  pixelParams: {
    blockSize: number;
    pixelsPerFrame: number;
    glitchRegion: number;
    delay: number;
  };
  exportSettings: {
    duration: 5 | 10;
    format: 'mp4' | 'gif';
  };
}

const initialState: AppState = {
  image: null,
  imageElement: null,
  activeEffect: 'ascii',
  asciiParams: {
    chars: ' .:-=+*#%@',
    fontSize: 10,
    brightnessBoost: 2.2,
    posterize: 32,
    scale: 1.15,
    parallax: 8,
    enableParallax: false,
    enableGlitch: true,
    enableReveal: true,
    animationSpeed: 1,
  },
  pixelParams: {
    blockSize: 8,
    pixelsPerFrame: 120,
    glitchRegion: 0.36,
    delay: 200,
  },
  exportSettings: {
    duration: 5,
    format: 'mp4',
  },
};

export default function Workbench() {
  const [state, setState] = useState<AppState>(initialState);

  const [isDesktop, setIsDesktop] = useState(true);

  const resetWorkspace = () => {
    setState(initialState);
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isDesktop) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center z-[9999]">
        <Monitor className="w-16 h-16 mb-6 text-accent animate-pulse" />
        <h1 className="text-2xl font-bold mb-4">Desktop Experience Only</h1>
        <p className="text-gray-400 max-w-sm">
          The Landing Effects Studio is a high-performance workbench designed for large displays. Please switch to a desktop for the full experience.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-studio-950 text-white overflow-hidden font-mono">
      <AssetSidebar 
        state={state} 
        setState={setState} 
        onReset={resetWorkspace}
      />
      
      <PreviewPanel 
        state={state} 
      />
      
      <ControlPanel 
        state={state} 
        setState={setState}
      />
    </div>
  );
}
