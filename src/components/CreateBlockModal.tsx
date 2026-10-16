import React, { useState } from 'react';
import { X, Clock, Plus, Tag, Flame } from 'lucide-react';
import { CategoryType, PriorityType, TimeBlock } from '../types';
import { CATEGORIES } from '../data/initialData';
import { addMinutesToTime } from '../utils/timeUtils';
import { audioEngine } from '../utils/audioEngine';

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  defaultTime?: string;
  onCreateBlock: (block: TimeBlock) => void;
}

export const CreateBlockModal: React.FC<CreateBlockModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultTime = '09:00',
  onCreateBlock,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('deep_work');
  const [priority, setPriority] = useState<PriorityType>('high');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState(defaultTime);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const endTime = addMinutesToTime(startTime, durationMinutes);
    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      title: title.trim(),
      category,
      priority,
      date,
      startTime,
      endTime,
      durationMinutes,
      completed: false,
      notes: notes.trim(),
      subtasks: [],
    };

    onCreateBlock(newBlock);
    audioEngine.playStartChime();
    onClose();
  };

  const currentEndTime = addMinutesToTime(startTime, durationMinutes);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0F172A] border border-[#2d3449] w-full max-w-lg rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#222a3d] flex items-center justify-between bg-[#0b1326]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#c3c0ff]" />
            <h3 className="text-sm font-display font-semibold text-[#F8FAFC]">
              Schedule Time-Block
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Mission Title
            </label>
            <input
              type="text"
              placeholder="e.g. Profiling Memory Leak in Ingress Gateway..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#6366F1] rounded-md px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none"
              autoFocus
              required
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(Object.keys(CATEGORIES) as CategoryType[]).map(catKey => {
                const conf = CATEGORIES[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => setCategory(catKey)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs border text-left transition-all ${
                      isSelected
                        ? 'bg-[#171f33] border-[#6366F1] text-white shadow-[0_0_10px_rgba(99,102,241,0.25)] font-medium'
                        : 'bg-[#0b1326] border-[#222a3d] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: conf.color }}
                    />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date, Start Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#0b1326] border border-[#222a3d] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-[#0b1326] border border-[#222a3d] rounded-md px-2.5 py-1.5 text-xs text-[#F8FAFC] font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                End Window
              </label>
              <div className="bg-[#0b1326] border border-[#222a3d] rounded-md px-2.5 py-1.5 text-xs text-[#89ceff] font-mono">
                {currentEndTime} ({durationMinutes}m)
              </div>
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Duration Preset
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[15, 30, 45, 60, 90, 120].map(mins => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-1.5 rounded text-xs font-mono transition-all ${
                    durationMinutes === mins
                      ? 'bg-[#4338CA] text-white font-bold shadow-[0_0_8px_rgba(67,56,202,0.5)]'
                      : 'bg-[#0b1326] border border-[#222a3d] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Priority Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'high', label: 'P1 - High (Focus Core)' },
                { id: 'medium', label: 'P2 - Medium' },
                { id: 'low', label: 'P3 - Low / Buffer' },
              ].map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as PriorityType)}
                  className={`py-1.5 text-xs font-mono rounded transition-all border ${
                    priority === p.id
                      ? 'bg-[#171f33] border-[#6366F1] text-white font-medium'
                      : 'bg-[#0b1326] border-[#222a3d] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Context Notes
            </label>
            <textarea
              rows={2}
              placeholder="Success criteria, repo branches, command references..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#0b1326] border border-[#222a3d] focus:border-[#6366F1] rounded-md px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none resize-none"
            />
          </div>

          {/* Submit / Cancel */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222a3d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#94A3B8] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-md bg-[#4338CA] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-[0_0_15px_rgba(67,56,202,0.4)] transition-all"
            >
              Lock Into Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
