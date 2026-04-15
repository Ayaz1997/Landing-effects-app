'use client';

import React from 'react';
import { AppState } from './Workbench';
import { Settings, Sliders, Dna, Download } from 'lucide-react';
import { ExportEngine } from './ExportEngine';

interface ControlPanelProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ControlPanel({ state, setState }: ControlPanelProps) {
  const updateAscii = (key: keyof AppState['asciiParams'], value: any) => {
    setState(prev => ({
      ...prev,
      asciiParams: { ...prev.asciiParams, [key]: value }
    }));
  };

  const updatePixel = (key: keyof AppState['pixelParams'], value: any) => {
    setState(prev => ({
      ...prev,
      pixelParams: { ...prev.pixelParams, [key]: value }
    }));
  };

  return (
    <aside className="w-80 h-full border-l studio-border bg-studio-900 flex flex-col z-20 overflow-y-auto">
      <div className="p-6 border-b studio-border">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase flex items-center gap-2">
          <Settings className="w-3 h-3 text-accent" />
          Properties
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {state.activeEffect === 'ascii' ? (
          <div className="space-y-6">
            <section className="space-y-4">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <Sliders className="w-3 h-3" /> Core Render
              </label>
              
              <div className="space-y-4">
                <ControlGroup label="Font Size" value={state.asciiParams.fontSize} unit="px">
                  <input 
                    type="range" min="4" max="24" step="1" 
                    value={state.asciiParams.fontSize}
                    onChange={(e) => updateAscii('fontSize', parseInt(e.target.value))}
                  />
                </ControlGroup>

                <ControlGroup label="Brightness" value={state.asciiParams.brightnessBoost.toFixed(1)} unit="x">
                  <input 
                    type="range" min="1" max="5" step="0.1" 
                    value={state.asciiParams.brightnessBoost}
                    onChange={(e) => updateAscii('brightnessBoost', parseFloat(e.target.value))}
                  />
                </ControlGroup>

                <ControlGroup label="Posterize" value={state.asciiParams.posterize} unit="lv">
                  <input 
                    type="range" min="2" max="64" step="2" 
                    value={state.asciiParams.posterize}
                    onChange={(e) => updateAscii('posterize', parseInt(e.target.value))}
                  />
                </ControlGroup>
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <Dna className="w-3 h-3" /> Dynamics & Effects
              </label>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Parallax</span>
                  <input 
                    type="checkbox" 
                    checked={state.asciiParams.enableParallax} 
                    onChange={(e) => updateAscii('enableParallax', e.target.checked)}
                    className="accent-white"
                  />
                </div>
                {state.asciiParams.enableParallax && (
                  <ControlGroup label="Intensity" value={state.asciiParams.parallax} unit="st">
                    <input 
                      type="range" min="0" max="20" step="1" 
                      value={state.asciiParams.parallax}
                      onChange={(e) => updateAscii('parallax', parseInt(e.target.value))}
                    />
                  </ControlGroup>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Glitch Bands</span>
                  <input 
                    type="checkbox" 
                    checked={state.asciiParams.enableGlitch} 
                    onChange={(e) => updateAscii('enableGlitch', e.target.checked)}
                    className="accent-white"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-tighter">Edge Reveal</span>
                  <input 
                    type="checkbox" 
                    checked={state.asciiParams.enableReveal} 
                    onChange={(e) => updateAscii('enableReveal', e.target.checked)}
                    className="accent-white"
                  />
                </div>

                <ControlGroup label="Anim Speed" value={state.asciiParams.animationSpeed.toFixed(1)} unit="v">
                  <input 
                    type="range" min="0.1" max="3" step="0.1" 
                    value={state.asciiParams.animationSpeed}
                    onChange={(e) => updateAscii('animationSpeed', parseFloat(e.target.value))}
                  />
                </ControlGroup>

                <ControlGroup label="Zoom" value={state.asciiParams.scale.toFixed(2)} unit="x">
                  <input 
                    type="range" min="0.5" max="2" step="0.05" 
                    value={state.asciiParams.scale}
                    onChange={(e) => updateAscii('scale', parseFloat(e.target.value))}
                  />
                </ControlGroup>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-4">
              <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase flex items-center gap-2">
                <Sliders className="w-3 h-3" /> Pixel Configuration
              </label>
              
              <div className="space-y-4">
                <ControlGroup label="Block Size" value={state.pixelParams.blockSize} unit="px">
                  <input 
                    type="range" min="2" max="32" step="2" 
                    value={state.pixelParams.blockSize}
                    onChange={(e) => updatePixel('blockSize', parseInt(e.target.value))}
                  />
                </ControlGroup>

                <ControlGroup label="Speed" value={state.pixelParams.pixelsPerFrame} unit="v">
                  <input 
                    type="range" min="10" max="500" step="10" 
                    value={state.pixelParams.pixelsPerFrame}
                    onChange={(e) => updatePixel('pixelsPerFrame', parseInt(e.target.value))}
                  />
                </ControlGroup>

                <ControlGroup label="Glitch" value={Math.round(state.pixelParams.glitchRegion * 100)} unit="%">
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={state.pixelParams.glitchRegion}
                    onChange={(e) => updatePixel('glitchRegion', parseFloat(e.target.value))}
                  />
                </ControlGroup>
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="p-6 border-t studio-border bg-studio-950/50">
        <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4 block">Workspace Export</label>
        <ExportEngine 
          state={state} 
          setExportSettings={(settings) => setState(prev => ({ ...prev, exportSettings: settings }))}
        />
      </div>
    </aside>
  );
}

function ControlGroup({ label, value, unit, children }: { label: string; value: any; unit: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{label}</span>
        <span className="text-[11px] font-mono text-white flex items-baseline gap-0.5">
          {value}
          <span className="text-[8px] text-gray-600 font-bold uppercase">{unit}</span>
        </span>
      </div>
      {children}
    </div>
  );
}
