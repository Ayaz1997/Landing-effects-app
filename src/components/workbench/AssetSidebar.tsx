'use client';

import React, { useRef } from 'react';
import { AppState, EffectType } from './Workbench';
import { Upload, Terminal, Grid3X3, Layers, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface AssetSidebarProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onReset: () => void;
}

export function AssetSidebar({ state, setState, onReset }: AssetSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setState(prev => ({ ...prev, image: src, imageElement: img }));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const effects: { id: EffectType; label: string; icon: any }[] = [
    { id: 'ascii', label: 'ASCII Render', icon: Terminal },
    { id: 'pixel', label: 'Pixel Reveal', icon: Grid3X3 },
  ];

  return (
    <aside className="w-80 h-full border-r studio-border bg-studio-900 flex flex-col z-20 overflow-y-auto">
      <div className="p-6 border-b studio-border flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-2">
          <Layers className="w-3 h-3" />
          Studio Workbench
        </h2>
        {state.image && (
          <button 
            onClick={onReset}
            className="p-1.5 hover:bg-white/5 rounded-md text-gray-600 hover:text-red-400 transition-colors"
            title="Reset Workspace"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-8">
        {/* Source Section */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase tracking-widest">Input Source</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "group relative h-32 border border-dashed studio-border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
              "hover:border-white/40 hover:bg-white/5",
              state.image && "border-solid border-white/20"
            )}
          >
            {state.image ? (
              <img src={state.image} className="w-full h-full object-cover rounded-lg opacity-20 group-hover:opacity-10 transition-opacity" />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
              </div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-[0.2em]">
                {state.image ? "Replace Input" : "Drop Asset"}
              </span>
              <span className="text-[8px] text-gray-600 mt-2 uppercase tracking-widest">PNG, JPG, WEBP</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        </section>

        {/* Engine Selection */}
        <section className="space-y-4">
          <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Engine Selection</label>
          <div className="space-y-2">
            {effects.map((effect) => {
              const Icon = effect.icon;
              const isActive = state.activeEffect === effect.id;
              
              return (
                <button
                  key={effect.id}
                  onClick={() => setState(prev => ({ ...prev, activeEffect: effect.id }))}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 border",
                    isActive 
                      ? "bg-accent/10 border-accent text-accent glow-accent" 
                      : "border-transparent text-gray-500 hover:text-white hover:bg-studio-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{effect.label}</span>
                  {isActive && <div className="ml-auto w-1 h-1 bg-accent rounded-full animate-ping" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-auto p-6 border-t studio-border text-center">
        <p className="text-[9px] text-gray-600 uppercase tracking-widest leading-relaxed">
          v1.0.4 Release<br/>
          Engine: Landing-Effects v2.4
        </p>
      </div>
    </aside>
  );
}
