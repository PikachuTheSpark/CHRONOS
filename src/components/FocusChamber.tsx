import React, { useState, useEffect, useRef } from 'react';
import {
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  CheckCircle2,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Layers,
} from 'lucide-react';
import { TimeBlock, SoundscapeType } from '../types';
import { CATEGORIES } from '../data/initialData';
import { audioEngine } from '../utils/audioEngine';

interface FocusChamberProps {
  block: TimeBlock | null;
  onExit: () => void;
  soundscape: SoundscapeType;
  onSoundscapeChange: (type: SoundscapeType) => void;
  soundVolume: number;
  onSoundVolumeChange: (vol: number) => void;
  onCompleteBlock?: (blockId: string) => void;
}

export const FocusChamber: React.FC<FocusChamberProps> = ({
  block,
  onExit,
  soundscape,
  onSoundscapeChange,
  soundVolume,
  onSoundVolumeChange,
  onCompleteBlock,
}) => {
  const initialDuration = block ? block.durationMinutes * 60 : 50 * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(initialDuration);
  const [totalSeconds, setTotalSeconds] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [subtasks, setSubtasks] = useState(block ? block.subtasks : []);
  const [checklist, setChecklist] = useState([
    { id: 'c1', label: 'Peripheral Notifications Silenced', checked: true },
    { id: 'c2', label: 'Single Task Singularity (No Multitasking)', checked: true },
    { id: 'c3', label: 'Cognitive Masking Soundscape Engaged', checked: soundscape !== 'off' },
    { id: 'c4', label: 'Hydration & Posture Calibrated', checked: false },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio waveform animation visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      ctx.lineWidth = 2;
      ctx.strokeStyle = soundscape !== 'off' ? '#6366F1' : '#222a3d';
      ctx.beginPath();

      const bars = 48;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth;
        const distFromCenter = 1 - Math.abs(i - bars / 2) / (bars / 2);
        const amp = soundscape !== 'off' && isRunning
          ? Math.sin(phase + i * 0.3) * 20 * distFromCenter * soundVolume
          : Math.sin(phase + i * 0.1) * 3 * distFromCenter;

        ctx.moveTo(x, mid - amp);
        ctx.lineTo(x, mid + amp);
      }
      ctx.stroke();

      phase += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [soundscape, isRunning, soundVolume]);

  // Countdown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            audioEngine.playCompleteChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);

  const handleToggleTimer = () => {
    if (!isRunning) {
      audioEngine.playStartChime();
      if (soundscape === 'off') {
        onSoundscapeChange('drone');
        audioEngine.playSoundscape('drone');
      }
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleToggleCheck = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
    audioEngine.playTick();
  };

  const handleToggleSubtask = (stId: string) => {
    setSubtasks(prev =>
      prev.map(st => (st.id === stId ? { ...st, completed: !st.completed } : st))
    );
    audioEngine.playTick();
  };

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;
  const catConfig = block ? CATEGORIES[block.category] : CATEGORIES.deep_work;

  return (
    <div className="fixed inset-0 z-50 bg-[#060e20] text-[#F8FAFC] flex flex-col justify-between p-6 md:p-12 select-none overflow-y-auto">
      {/* Top Cockpit Telemetry Bar */}
      <div className="flex items-center justify-between border-b border-[#222a3d] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#171f33] border border-[#6366F1]/50 text-[#c3c0ff]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold tracking-wider uppercase text-[#c3c0ff]">
              Deep Focus Chamber
            </h2>
            <span className="text-[10px] font-mono text-[#89ceff] tracking-widest">
              MONASTIC ISOLATION PROTOCOL
            </span>
          </div>
        </div>

        {/* Exit Chamber Button */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131b2e] hover:bg-[#1e293b] border border-[#222a3d] text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Chamber (Esc)</span>
        </button>
      </div>

      {/* Main Center Instrument: Giant Chronometer & Mission Scope */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-4xl mx-auto w-full">
        {/* Mission Title Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#131b2e] border border-[#222a3d] mb-3">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: catConfig.color }}
            />
            <span className="text-xs font-mono text-[#94A3B8] uppercase">
              {catConfig.label}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-display font-bold text-[#F8FAFC] max-w-2xl mx-auto leading-tight">
            {block ? block.title : 'Deep Cognitive Sprint'}
          </h1>
          {block?.notes && (
            <p className="text-sm text-[#94A3B8] max-w-xl mx-auto mt-2 italic">
              "{block.notes}"
            </p>
          )}
        </div>

        {/* Giant Monospace Chronometer Display */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="text-6xl md:text-8xl lg:text-9xl font-mono font-bold tracking-tight text-[#F8FAFC] tabular-nums drop-shadow-[0_0_35px_rgba(99,102,241,0.25)]">
            {timeFormatted}
          </div>

          {/* Linear Progress Bar */}
          <div className="w-64 md:w-96 h-1.5 bg-[#171f33] rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.8)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Ambient Waveform Visualizer */}
        <div className="w-full max-w-md h-12 my-4 flex items-center justify-center">
          <canvas ref={canvasRef} width={400} height={48} className="w-full h-full" />
        </div>

        {/* Primary Flight Controls */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleToggleTimer}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-lg font-mono font-semibold text-sm tracking-wider shadow-2xl transition-all active:scale-95 ${
              isRunning
                ? 'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                : 'bg-[#4338CA] hover:bg-[#4F46E5] text-white shadow-[0_0_25px_rgba(67,56,202,0.4)]'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            <span>{isRunning ? 'PAUSE CLOCK' : 'START SESSION'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-lg bg-[#131b2e] hover:bg-[#1e293b] text-[#94A3B8] hover:text-white border border-[#222a3d] transition-colors"
            title="Reset Countdown"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {block && onCompleteBlock && (
            <button
              onClick={() => {
                onCompleteBlock(block.id);
                audioEngine.playCompleteChime();
                onExit();
              }}
              className="flex items-center gap-2 px-4 py-3.5 rounded-lg bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/50 text-[#4edea3] font-mono text-xs font-semibold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Mission</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Panel: Subtasks & Distraction Blocker Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#222a3d] pt-4 max-w-4xl mx-auto w-full">
        {/* Distraction Blocker Protocol */}
        <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Anti-Distraction Protocol</span>
          </div>
          <div className="space-y-1.5">
            {checklist.map(item => (
              <label
                key={item.id}
                onClick={() => handleToggleCheck(item.id)}
                className="flex items-center gap-2.5 text-xs cursor-pointer group select-none text-[#F8FAFC]"
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                    item.checked
                      ? 'bg-[#10B981] border-[#10B981] text-white'
                      : 'border-[#475569] bg-[#090D16]'
                  }`}
                >
                  {item.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className={item.checked ? 'text-[#94A3B8]' : 'text-[#F8FAFC]'}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Acoustic Soundscapes Controls */}
        <div className="p-3.5 rounded-lg bg-[#0F172A] border border-[#222a3d] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#89ceff]" />
                <span>Masking Soundscape</span>
              </span>
              <span className="text-[11px] font-mono text-[#c3c0ff] uppercase">
                {soundscape}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 mb-2">
              {[
                { id: 'off', label: 'Mute' },
                { id: 'drone', label: 'Drone' },
                { id: 'rain', label: 'Rain' },
                { id: 'binaural', label: 'Alpha' },
                { id: 'whitenoise', label: 'Noise' },
              ].map(snd => (
                <button
                  key={snd.id}
                  onClick={() => {
                    onSoundscapeChange(snd.id as SoundscapeType);
                    audioEngine.playSoundscape(snd.id as SoundscapeType);
                  }}
                  className={`py-1 text-[11px] font-mono rounded transition-colors text-center ${
                    soundscape === snd.id
                      ? 'bg-[#4338CA] text-white font-bold'
                      : 'bg-[#131b2e] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#64748B]">VOLUME</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={e => {
                const val = parseFloat(e.target.value);
                onSoundVolumeChange(val);
                audioEngine.setVolume(val);
              }}
              className="flex-1 accent-[#6366F1] h-1.5 bg-[#0b1326] rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-mono text-[#94A3B8] w-8 text-right">
              {Math.round(soundVolume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
