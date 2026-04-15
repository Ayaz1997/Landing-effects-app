'use client';

import React, { useRef, useEffect, useState } from 'react';
import { AppState } from './Workbench';
import { createAsciiRenderer, createPixelReveal } from '@/lib/effects';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PreviewPanelProps {
  state: AppState;
}

export function PreviewPanel({ state }: PreviewPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !state.imageElement || !state.image) return;

    setIsRendering(true);
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match image aspect ratio
    const img = state.imageElement;
    const maxWidth = containerRef.current?.clientWidth || 800;
    const maxHeight = containerRef.current?.clientHeight || 600;
    
    let w = img.width;
    let h = img.height;
    
    // Scale to fit container while maintaining aspect ratio
    const ratio = Math.min(maxWidth / w, maxHeight / h) * 0.9;
    canvas.width = w * ratio;
    canvas.height = h * ratio;

    let cleanup: () => void = () => {};

    if (state.activeEffect === 'ascii') {
      cleanup = createAsciiRenderer({
        canvas,
        image: img,
        ...state.asciiParams
      });
    } else {
      cleanup = createPixelReveal({
        canvas,
        image: img,
        ...state.pixelParams
      });
    }

    setIsRendering(false);
    return () => {
      if (cleanup) cleanup();
    };
  }, [state.activeEffect, state.image, state.asciiParams, state.pixelParams]);

  return (
    <main className="flex-1 bg-studio-950 relative flex flex-col items-center justify-center p-12 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div ref={containerRef} className="relative z-10 w-full h-full flex items-center justify-center">
        {!state.image ? (
          <div className="flex flex-col items-center gap-4 text-gray-700 animate-pulse">
            <RefreshCw className="w-12 h-12" />
            <span className="text-sm font-medium tracking-widest uppercase">Awaiting System Input</span>
          </div>
        ) : (
          <div 
            className="relative studio-border bg-black shadow-2xl transition-transform duration-300 ease-out"
            style={{ 
              transform: `scale(${zoom})`,
              boxShadow: state.activeEffect === 'ascii' ? '0 0 60px rgba(0,255,242,0.1)' : 'none'
            }}
          >
            <canvas ref={canvasRef} className="display-block" />
            
            {/* Corner Indicators */}
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-accent" />
            <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-accent" />
            <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-accent" />
            <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-accent" />
          </div>
        )}
      </div>

      {/* View Controls */}
      {state.image && (
        <div className="absolute bottom-8 right-8 glass px-4 py-2 rounded-full flex items-center gap-4 z-30">
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="text-gray-400 hover:text-white"><Minimize2 className="w-4 h-4" /></button>
          <span className="text-[10px] font-bold w-12 text-center text-white">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="text-gray-400 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-4 left-8 text-[9px] text-gray-600 uppercase tracking-widest flex gap-6 z-30">
        <span className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", state.image ? "bg-white animate-pulse" : "bg-red-500")} />
          Status: {state.image ? 'Processing' : 'Standby'}
        </span>
        {state.imageElement && (
          <span>Res: {state.imageElement.width}x{state.imageElement.height}</span>
        )}
      </div>
    </main>
  );
}
