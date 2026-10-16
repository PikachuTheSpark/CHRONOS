import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { TimeBlock, CategoryType, PriorityType, SoundscapeType } from '../types';
import { CATEGORIES } from '../data/initialData';
import { addMinutesToTime, calculateDuration } from '../utils/timeUtils';
import { audioEngine } from '../utils/audioEngine';

interface SidebarRightProps {
  block: TimeBlock | null;
  onClose: () => void;
  onUpdateBlock: (updated: TimeBlock) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (block: TimeBlock) => void;
  onEnterChamber: (blockId?: string) => void;
  soundscape: SoundscapeType;
  onSoundscapeChange: (type: SoundscapeType) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  block,
  onClose,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onEnterChamber,
  soundscape,
  onSoundscapeChange,
}) => {
  // Timer internal state
  const [timerMode, setTimerMode] = useState<'25m' | '50m' | '90m' | '5m'>('25m');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Synchronize timer with mode switch
  const handleSetTimerPreset = (preset: '25m' | '50m' | '90m' | '5m') => {
    setTimerMode(preset);
    setIsRunning(false);
    let sec = 25 * 60;
    if (preset === '50m') sec = 50 * 60;
    if (preset === '90m') sec = 90 * 60;
    if (preset === '5m') sec = 5 * 60;
    setTotalSeconds(sec);
    setRemainingSeconds(sec);
  };

  // Timer tick effect
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
    }
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const handleAddFiveMinutes = () => {
    setRemainingSeconds(prev => prev + 300);
    setTotalSeconds(prev => prev + 300);
  };

  // Form handlers for active block
  const handleTitleChange = (val: string) => {
    if (!block) return;
    onUpdateBlock({ ...block, title: val });
  };

  const handleCategoryChange = (val: CategoryType) => {
    if (!block) return;
    onUpdateBlock({ ...block, category: val });
  };

  const handlePriorityChange = (val: PriorityType) => {
    if (!block) return;
    onUpdateBlock({ ...block, priority: val });
  };

  const handleStartTimeChange = (val: string) => {
    if (!block) return;
    const newEnd = addMinutesToTime(val, block.durationMinutes);
    onUpdateBlock({ ...block, startTime: val, endTime: newEnd });
  };

  const handleEndTimeChange = (val: string) => {
    if (!block) return;
    const duration = calculateDuration(block.startTime, val);
    onUpdateBlock({ ...block, endTime: val, durationMinutes: duration });
  };

  const handleDurationPreset = (mins: number) => {
    if (!block) return;
    const newEnd = addMinutesToTime(block.startTime, mins);
    onUpdateBlock({ ...block, durationMinutes: mins, endTime: newEnd });
  };

  const handleNotesChange = (val: string) => {
    if (!block) return;
    onUpdateBlock({ ...block, notes: val });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!block || !newSubtaskText.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false,
    };
    onUpdateBlock({
      ...block,
      subtasks: [...block.subtasks, newSt],
    });
    setNewSubtaskText('');
    audioEngine.playTick();
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (!block) return;
    audioEngine.playTick();
    const updated = block.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateBlock({ ...block, subtasks: updated });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!block) return;
    const updated = block.subtasks.filter(st => st.id !== subtaskId);
    onUpdateBlock({ ...block, subtasks: updated });
  };

  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;
  const minsLeft = Math.floor(remainingSeconds / 60);
  const secsLeft = remainingSeconds % 60;
  const timeDisplay = `${String(minsLeft).padStart(2, '0')}:${String(secsLeft).padStart(2, '0')}`;

  const catConfig = block ? CATEGORIES[block.category] : null;

  return (
    <aside className="w-full lg:w-80 xl:w-96 border-l border-[#222a3d] bg-[#0b1326] flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Top Header */}
      <div className="h-14 border-b border-[#222a3d] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#c3c0ff]" />
          <span className="text-xs font-display font-semibold text-[#F8FAFC] uppercase tracking-wider">
            {block ? 'Block Inspector' : 'Focus Chronometer'}
          </span>
        </div>
        {block && (
          <button
            onClick={onClose}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1e293b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Integrated Chronos Precision Timer Widget */}
      <div className="p-4 border-b border-[#222a3d] bg-[#0d152a]/70">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
            Precision Timer
          </span>
          <div className="flex items-center gap-1 bg-[#060e20] p-0.5 rounded border border-[#222a3d]">
            {(['25m', '50m', '90m', '5m'] as const).map(preset => (
              <button
                key={preset}
                onClick={() => handleSetTimerPreset(preset)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  timerMode === preset
                    ? 'bg-[#4338CA] text-white font-medium'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Circular Display */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeWidth="5"
                className="text-[#171f33]"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeWidth="5"
                className={`transition-all duration-300 ${
                  isRunning ? 'text-[#6366F1]' : 'text-[#4338CA]'
                }`}
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (1 - progress / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Center Time Readout */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold tracking-tight text-[#F8FAFC] tabular-nums">
                {timeDisplay}
              </span>
              <span className="text-[10px] font-mono text-[#89ceff] tracking-widest mt-0.5 uppercase">
                {isRunning ? 'FOCUS ACTIVE' : 'STANDBY'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleToggleTimer}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs shadow-lg transition-all ${
                isRunning
                  ? 'bg-[#F43F5E] hover:bg-[#E11D48] text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'bg-[#4338CA] hover:bg-[#4F46E5] text-white shadow-[0_0_15px_rgba(67,56,202,0.3)]'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'PAUSE' : 'ENGAGE FOCUS'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              className="p-2 rounded-md bg-[#131b2e] hover:bg-[#1e293b] text-[#94A3B8] hover:text-white border border-[#222a3d] transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAddFiveMinutes}
              className="px-2 py-2 rounded-md bg-[#131b2e] hover:bg-[#1e293b] text-[#c3c0ff] border border-[#222a3d] text-[11px] font-mono font-medium transition-colors"
              title="Add 5 Minutes"
            >
              +5m
            </button>
          </div>
        </div>
      </div>

      {/* Task Details or Empty State */}
      {block ? (
        <div className="p-4 space-y-4 flex-1">
          {/* Mission Title Input */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
              Mission Title
            </label>
            <input
              type="text"
              value={block.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full bg-[#0F172A] border border-[#222a3d] focus:border-[#6366F1] rounded-md px-3 py-2 text-sm text-[#F8FAFC] font-medium outline-none transition-colors"
            />
          </div>

          {/* Category & Priority Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                Category
              </label>
              <select
                value={block.category}
                onChange={e => handleCategoryChange(e.target.value as CategoryType)}
                className="w-full bg-[#0F172A] border border-[#222a3d] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] outline-none font-medium"
              >
                <option value="deep_work">Deep Work</option>
                <option value="meeting">Meeting / Sync</option>
                <option value="review">Code / Review</option>
                <option value="urgent">Critical / Urgent</option>
                <option value="buffer">Buffer & Rest</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                Priority
              </label>
              <select
                value={block.priority}
                onChange={e => handlePriorityChange(e.target.value as PriorityType)}
                className="w-full bg-[#0F172A] border border-[#222a3d] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] outline-none font-medium"
              >
                <option value="high">P1 - High</option>
                <option value="medium">P2 - Medium</option>
                <option value="low">P3 - Low</option>
              </select>
            </div>
          </div>

          {/* Time Window & Duration Chips */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
              Temporal Window
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-1.5 bg-[#0F172A] border border-[#222a3d] rounded-md px-2 py-1.5">
                <span className="text-[10px] font-mono text-[#64748B]">START</span>
                <input
                  type="time"
                  value={block.startTime}
                  onChange={e => handleStartTimeChange(e.target.value)}
                  className="bg-transparent text-xs text-[#F8FAFC] font-mono outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#0F172A] border border-[#222a3d] rounded-md px-2 py-1.5">
                <span className="text-[10px] font-mono text-[#64748B]">END</span>
                <input
                  type="time"
                  value={block.endTime}
                  onChange={e => handleEndTimeChange(e.target.value)}
                  className="bg-transparent text-xs text-[#F8FAFC] font-mono outline-none w-full"
                />
              </div>
            </div>

            {/* Quick Duration Buttons */}
            <div className="flex items-center gap-1">
              {[15, 30, 45, 60, 90, 120].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleDurationPreset(mins)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono transition-colors ${
                    block.durationMinutes === mins
                      ? 'bg-[#4338CA] text-white font-bold'
                      : 'bg-[#131b2e] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Micro-Milestones ({block.subtasks.filter(s => s.completed).length}/{block.subtasks.length})
              </label>
            </div>

            <div className="space-y-1.5 mb-2">
              {block.subtasks.map(st => (
                <div
                  key={st.id}
                  className="flex items-center justify-between gap-2 p-2 rounded bg-[#0F172A] border border-[#222a3d] group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        st.completed
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : 'border-[#475569] hover:border-[#6366F1] bg-[#090D16]'
                      }`}
                    >
                      {st.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>
                    <span
                      className={`text-xs truncate ${
                        st.completed ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'
                      }`}
                    >
                      {st.text}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#64748B] hover:text-[#F43F5E] transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add subtask input */}
            <form onSubmit={handleAddSubtask} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add micro-step..."
                value={newSubtaskText}
                onChange={e => setNewSubtaskText(e.target.value)}
                className="flex-1 bg-[#0F172A] border border-[#222a3d] focus:border-[#6366F1] rounded px-2.5 py-1 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-[#171f33] hover:bg-[#4338CA] text-[#c3c0ff] hover:text-white rounded border border-[#2d3449] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
              Engineering Notes & Context
            </label>
            <textarea
              rows={3}
              value={block.notes}
              onChange={e => handleNotesChange(e.target.value)}
              placeholder="Key objectives, links, commands..."
              className="w-full bg-[#0F172A] border border-[#222a3d] focus:border-[#6366F1] rounded-md px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none resize-none transition-colors"
            />
          </div>

          {/* Action Operations */}
          <div className="pt-2 border-t border-[#222a3d] space-y-2">
            <button
              onClick={() => onEnterChamber(block.id)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-[#4338CA]/20 hover:bg-[#4338CA]/40 border border-[#6366F1] text-[#c3c0ff] text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.2)] transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#89ceff]" />
              <span>Launch Focus Chamber</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onDuplicateBlock(block)}
                className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => onDeleteBlock(block.id)}
                className="flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-[#131b2e] hover:bg-[#F43F5E]/20 border border-[#222a3d] hover:border-[#F43F5E]/40 text-xs text-[#F43F5E] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-[#64748B] flex-1 flex flex-col items-center justify-center">
          <Clock className="w-8 h-8 text-[#1e293b] mb-2" />
          <p className="font-medium text-[#94A3B8]">No Block Selected</p>
          <p className="text-[11px] mt-1 text-[#64748B] max-w-[200px]">
            Click any block on the timeline to inspect its parameters, checklist, and notes.
          </p>
        </div>
      )}
    </aside>
  );
};
