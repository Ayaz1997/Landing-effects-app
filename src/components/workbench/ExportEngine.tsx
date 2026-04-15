'use client';

import React, { useState, useRef } from 'react';
import { AppState } from './Workbench';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Film, Image as ImageIcon, Loader2, Timer, Clock, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface ExportEngineProps {
  state: AppState;
  setExportSettings: (settings: AppState['exportSettings']) => void;
}

export function ExportEngine({ state, setExportSettings }: ExportEngineProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcoding'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  
  const ffmpegRef = useRef(new FFmpeg());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const loadFFmpeg = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  };

  const runExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const seconds = state.exportSettings.duration;
    setStatus('recording');
    setTimeLeft(seconds);
    chunksRef.current = [];
    
    const stream = canvas.captureStream(30); 
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      handleTranscode();
    };

    mediaRecorderRef.current = recorder;
    recorder.start();

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          recorder.stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTranscode = async () => {
    setStatus('transcoding');
    setIsExporting(true);
    setProgress(0);

    const { format } = state.exportSettings;

    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) await loadFFmpeg();

      const webmBlob = new Blob(chunksRef.current, { type: 'video/webm' });
      const webmFile = await fetchFile(webmBlob);
      await ffmpeg.writeFile('input.webm', webmFile);

      if (format === 'mp4') {
        // Refined MP4 encoding: libx264, CRF 28 (good quality/size balance), preset medium
        // yuv420p is required for QuickTime/iPhone compatibility
        await ffmpeg.exec([
          '-i', 'input.webm', 
          '-c:v', 'libx264', 
          '-preset', 'medium', 
          '-crf', '28', 
          '-pix_fmt', 'yuv420p', 
          '-movflags', '+faststart',
          'output.mp4'
        ]);
        const mp4Data = await ffmpeg.readFile('output.mp4');
        if (mp4Data.length === 0) throw new Error('MP4 Export produced 0 bytes');
        download(mp4Data, 'video/mp4', `studio-build-${Date.now()}.mp4`);
      } else {
        // Enhanced GIF encoding: Generate palette first for better quality/size balance
        await ffmpeg.exec(['-i', 'input.webm', '-vf', 'fps=15,scale=480:-1:flags=lanczos,palettegen', 'palette.png']);
        await ffmpeg.exec(['-i', 'input.webm', '-i', 'palette.png', '-filter_complex', 'fps=15,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse', 'output.gif']);
        const gifData = await ffmpeg.readFile('output.gif');
        download(gifData, 'image/gif', `studio-build-${Date.now()}.gif`);
      }

    } catch (error) {
      console.error('Studio Export failed:', error);
    } finally {
      setIsExporting(false);
      setStatus('idle');
      setProgress(0);
    }
  };

  const download = (data: any, type: string, fileName: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isBusy = status !== 'idle';
  const isDisabled = !state.image || isBusy;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Format</label>
          <div className="grid grid-cols-2 gap-2">
            <SelectionButton 
              active={state.exportSettings.format === 'mp4'} 
              onClick={() => setExportSettings({ ...state.exportSettings, format: 'mp4' })}
              icon={Film}
              label="MP4 Video"
              disabled={isBusy}
            />
            <SelectionButton 
              active={state.exportSettings.format === 'gif'} 
              onClick={() => setExportSettings({ ...state.exportSettings, format: 'gif' })}
              icon={ImageIcon}
              label="GIF Loop"
              disabled={isBusy}
            />
          </div>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Duration</label>
          <div className="grid grid-cols-2 gap-2">
            <SelectionButton 
              active={state.exportSettings.duration === 5} 
              onClick={() => setExportSettings({ ...state.exportSettings, duration: 5 })}
              icon={Timer}
              label="5 Seconds"
              disabled={isBusy}
            />
            <SelectionButton 
              active={state.exportSettings.duration === 10} 
              onClick={() => setExportSettings({ ...state.exportSettings, duration: 10 })}
              icon={Clock}
              label="10 Seconds"
              disabled={isBusy}
            />
          </div>
        </div>
      </div>

      {status === 'idle' && (
        <button
          disabled={isDisabled}
          onClick={runExport}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-4 rounded-lg font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300",
            isDisabled 
              ? "bg-studio-900 text-gray-700 cursor-not-allowed border studio-border" 
              : "bg-white text-black hover:bg-gray-200"
          )}
        >
          <Download className="w-4 h-4" />
          Export Build
        </button>
      )}

      {status === 'recording' && (
        <div className="w-full flex flex-col items-center justify-center gap-3 py-6 rounded-lg bg-red-600/10 border border-red-600/50 text-red-500">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Capturing Live Build</span>
          </div>
          <span className="text-2xl font-mono tabular-nums">{timeLeft}s remaining</span>
        </div>
      )}

      {status === 'transcoding' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] text-white animate-pulse">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Transcoding Studio Assets...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-studio-800 rounded-full overflow-hidden border studio-border">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SelectionButton({ active, onClick, icon: Icon, label, disabled }: { active: boolean; onClick: () => void; icon: any; label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-md border text-left transition-all duration-200",
        active 
          ? "border-white bg-white/10 text-white" 
          : "border-studio-border text-gray-500 hover:border-white/30 hover:text-gray-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", active ? "text-white" : "text-gray-600")} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
      </div>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full ring-2 ring-white/20" />}
    </button>
  );
}
