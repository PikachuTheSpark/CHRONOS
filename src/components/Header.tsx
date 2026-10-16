import React, { useState, useEffect } from 'react';
import {
  Clock,
  Sparkles,
  Maximize2,
  Download,
  Plus,
  Volume2,
  VolumeX,
  Sliders,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { TimelineViewMode, SoundscapeType } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface HeaderProps {
  currentView: TimelineViewMode;
  onViewChange: (view: TimelineViewMode) => void;
  onOpenCreateModal: () => void;
  onOpenExportModal: () => void;
  onEnterChamber: () => void;
  soundscape: SoundscapeType;
  onSoundscapeChange: (sound: SoundscapeType) => void;
  soundVolume: number;
  onSoundVolumeChange: (vol: number) => void;
  todayCompletedCount: number;
  todayTotalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  onOpenExportModal,
  onEnterChamber,
  soundscape,
  onSoundscapeChange,
  soundVolume,
  onSoundVolumeChange,
  todayCompletedCount,
  todayTotalCount,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [showAudioPopover, setShowAudioPopover] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      };
      setDateStr(now.toLocaleDateString(undefined, options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const completionPct = todayTotalCount > 0 ? Math.round((todayCompletedCount / todayTotalCount) * 100) : 0;

  return (
    <header className="h-16 border-b border-[#222a3d] bg-[#0b1326] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Temporal Beacon */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-md bg-[#171f33] border border-[#4338CA]/40 shadow-[0_0_15px_rgba(67,56,202,0.25)]">
          <Clock className="w-5 h-5 text-[#c3c0ff]" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-base md:text-lg tracking-tight text-[#F8FAFC]">
              CHRONOS
            </h1>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-[#4338CA]/30 text-[#c3c0ff] border border-[#6366F1]/30 font-semibold">
              PRECISION FOCUS
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span className="font-mono text-[#89ceff] font-medium tabular-nums">{timeStr || '00:00:00'}</span>
            <span className="text-[#464554]">•</span>
            <span className="text-[11px] hidden sm:inline">{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Center View Controls */}
      <div className="hidden lg:flex items-center bg-[#060e20] p-1 rounded-lg border border-[#222a3d]">
        <button
          onClick={() => onViewChange('1-day')}
          className={`px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === '1-day'
              ? 'bg-[#4338CA] text-white shadow-[0_2px_10px_rgba(67,56,202,0.4)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171f33]'
          }`}
        >
          1-Day Plan
        </button>
        <button
          onClick={() => onViewChange('3-day')}
          className={`px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === '3-day'
              ? 'bg-[#4338CA] text-white shadow-[0_2px_10px_rgba(67,56,202,0.4)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171f33]'
          }`}
        >
          3-Day Sprint
        </button>
        <button
          onClick={() => onViewChange('7-day')}
          className={`px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === '7-day'
              ? 'bg-[#4338CA] text-white shadow-[0_2px_10px_rgba(67,56,202,0.4)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171f33]'
          }`}
        >
          7-Day Matrix
        </button>
        <button
          onClick={() => onViewChange('analytics')}
          className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
            currentView === 'analytics'
              ? 'bg-[#4338CA] text-white shadow-[0_2px_10px_rgba(67,56,202,0.4)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#171f33]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Chrono-Audit
        </button>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Daily Completion Indicator */}
        <div className="hidden xl:flex items-center gap-2.5 px-3 py-1 rounded-md bg-[#131b2e] border border-[#222a3d]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">Today’s Execution</span>
            <span className="text-xs font-mono font-medium text-[#F8FAFC]">
              {todayCompletedCount}/{todayTotalCount} <span className="text-[#10B981]">({completionPct}%)</span>
            </span>
          </div>
          <div className="w-12 h-1.5 bg-[#171f33] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] transition-all duration-500 rounded-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Ambient Soundscapes Synthesizer Popover */}
        <div className="relative">
          <button
            onClick={() => setShowAudioPopover(!showAudioPopover)}
            className={`p-2 rounded-md border text-xs flex items-center gap-1.5 transition-all ${
              soundscape !== 'off'
                ? 'bg-[#4338CA]/20 border-[#6366F1] text-[#c3c0ff] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                : 'bg-[#131b2e] border-[#222a3d] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155]'
            }`}
            title="Focus Soundscapes (Synthesized Audio Engine)"
          >
            {soundscape !== 'off' ? (
              <span className="flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-[#89ceff]" />
                <span className="font-mono text-[11px] uppercase hidden sm:inline">{soundscape}</span>
              </span>
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {showAudioPopover && (
            <div className="absolute right-0 mt-2 w-64 bg-[#171f33] border border-[#2d3449] rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.7)] p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#222a3d] mb-2">
                <span className="text-xs font-display font-semibold text-[#F8FAFC] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c3c0ff]" />
                  Acoustic Masking Engine
                </span>
                <span className="text-[10px] font-mono text-[#89ceff]">Web Audio</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {[
                  { id: 'off', label: 'Mute' },
                  { id: 'rain', label: 'Rain Cascade' },
                  { id: 'drone', label: 'Cyber Drone' },
                  { id: 'binaural', label: 'Alpha 10Hz' },
                  { id: 'whitenoise', label: 'Smooth Noise' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSoundscapeChange(item.id as SoundscapeType);
                      audioEngine.playSoundscape(item.id as SoundscapeType);
                    }}
                    className={`px-2 py-1.5 text-xs text-left rounded transition-colors ${
                      soundscape === item.id
                        ? 'bg-[#4338CA] text-white font-medium'
                        : 'bg-[#0f172a] text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1e293b]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {soundscape !== 'off' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#94A3B8] font-mono">
                    <span>Intensity</span>
                    <span>{Math.round(soundVolume * 100)}%</span>
                  </div>
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
                    className="w-full accent-[#6366F1] h-1.5 bg-[#0b1326] rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enter Fullscreen Focus Chamber Button */}
        <button
          onClick={onEnterChamber}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#131b2e] border border-[#4338CA]/40 text-[#c3c0ff] hover:bg-[#4338CA]/20 hover:border-[#6366F1] text-xs font-medium transition-all"
          title="Open Focus Chamber (F)"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#89ceff]" />
          <span>Chamber</span>
        </button>

        {/* Export Modal Button */}
        <button
          onClick={onOpenExportModal}
          className="p-2 rounded-md bg-[#131b2e] border border-[#222a3d] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155] transition-colors"
          title="Export Schedule (ICS / Markdown)"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Create Timeblock Button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#4338CA] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-[0_2px_12px_rgba(67,56,202,0.35)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Time-Block</span>
        </button>
      </div>
    </header>
  );
};
