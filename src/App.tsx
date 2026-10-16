/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { TimelineCanvas } from './components/TimelineCanvas';
import { SidebarRight } from './components/SidebarRight';
import { FocusChamber } from './components/FocusChamber';
import { AnalyticsView } from './components/AnalyticsView';
import { CreateBlockModal } from './components/CreateBlockModal';
import { ExportModal } from './components/ExportModal';
import {
  CategoryType,
  TimelineViewMode,
  SoundscapeType,
  TimeBlock,
  BacklogTask,
} from './types';
import { INITIAL_BLOCKS, INITIAL_BACKLOG, getFormattedDate } from './data/initialData';
import { timeToMinutes, minutesToTime, addMinutesToTime } from './utils/timeUtils';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const todayStr = getFormattedDate(0);

  // Persistent blocks state
  const [blocks, setBlocks] = useState<TimeBlock[]>(() => {
    try {
      const saved = localStorage.getItem('chronos_blocks');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BLOCKS;
  });

  // Persistent backlog state
  const [backlog, setBacklog] = useState<BacklogTask[]>(() => {
    try {
      const saved = localStorage.getItem('chronos_backlog');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_BACKLOG;
  });

  // App navigation & view state
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentView, setCurrentView] = useState<TimelineViewMode>('1-day');
  const [activeBlockId, setActiveBlockId] = useState<string | null>('tb-2'); // select primary deep work block initially
  const [activeCategories, setActiveCategories] = useState<CategoryType[]>([
    'deep_work',
    'meeting',
    'review',
    'urgent',
    'buffer',
  ]);

  // Soundscape state
  const [soundscape, setSoundscape] = useState<SoundscapeType>('off');
  const [soundVolume, setSoundVolume] = useState<number>(0.35);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalSlotTime, setCreateModalSlotTime] = useState('09:00');
  const [createModalDate, setCreateModalDate] = useState(todayStr);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('chronos_blocks', JSON.stringify(blocks));
    } catch {
      // ignore
    }
  }, [blocks]);

  useEffect(() => {
    try {
      localStorage.setItem('chronos_backlog', JSON.stringify(backlog));
    } catch {
      // ignore
    }
  }, [backlog]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCreateModalDate(selectedDate);
        setCreateModalSlotTime('10:00');
        setIsCreateModalOpen(true);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setCurrentView(prev => (prev === 'chamber' ? '1-day' : 'chamber'));
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setSelectedDate(todayStr);
      } else if (e.key === 'Escape') {
        if (currentView === 'chamber') {
          setCurrentView('1-day');
        } else if (isCreateModalOpen) {
          setIsCreateModalOpen(false);
        } else if (isExportModalOpen) {
          setIsExportModalOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, todayStr, currentView, isCreateModalOpen, isExportModalOpen]);

  // Helper to find next open slot for a given duration
  const findNextAvailableSlot = (date: string, durationMins: number): string => {
    const dayBlocks = blocks
      .filter(b => b.date === date)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    // Try finding slot starting from 08:30
    let candidateMins = 8 * 60 + 30;
    for (const b of dayBlocks) {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);

      if (candidateMins + durationMins <= bStart) {
        return minutesToTime(candidateMins);
      }
      if (candidateMins < bEnd) {
        candidateMins = Math.ceil(bEnd / 15) * 15;
      }
    }

    if (candidateMins + durationMins <= 22 * 60) {
      return minutesToTime(candidateMins);
    }
    return '14:00';
  };

  // Block handlers
  const handleCreateBlock = (newBlock: TimeBlock) => {
    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const handleUpdateBlock = (updated: TimeBlock) => {
    setBlocks(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeBlockId === id) {
      setActiveBlockId(null);
    }
  };

  const handleDuplicateBlock = (b: TimeBlock) => {
    const nextSlot = findNextAvailableSlot(b.date, b.durationMinutes);
    const duplicated: TimeBlock = {
      ...b,
      id: `tb-${Date.now()}`,
      title: `${b.title} (Clone)`,
      startTime: nextSlot,
      endTime: addMinutesToTime(nextSlot, b.durationMinutes),
      completed: false,
    };
    setBlocks(prev => [...prev, duplicated]);
    setActiveBlockId(duplicated.id);
  };

  const handleToggleComplete = (id: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, completed: !b.completed } : b))
    );
  };

  const handleSlotClick = (date: string, time: string) => {
    setCreateModalDate(date);
    setCreateModalSlotTime(time);
    setIsCreateModalOpen(true);
  };

  // Backlog handlers
  const handleAddBacklogTask = (task: BacklogTask) => {
    setBacklog(prev => [task, ...prev]);
  };

  const handleDeleteBacklogTask = (id: string) => {
    setBacklog(prev => prev.filter(t => t.id !== id));
  };

  const handleScheduleBacklogTask = (task: BacklogTask) => {
    const slot = findNextAvailableSlot(selectedDate, task.estimatedMinutes);
    const end = addMinutesToTime(slot, task.estimatedMinutes);

    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      title: task.title,
      category: task.category,
      priority: task.priority,
      date: selectedDate,
      startTime: slot,
      endTime: end,
      durationMinutes: task.estimatedMinutes,
      completed: false,
      notes: task.notes || '',
      subtasks: task.subtasks || [],
    };

    setBlocks(prev => [...prev, newBlock]);
    setBacklog(prev => prev.filter(t => t.id !== task.id));
    setActiveBlockId(newBlock.id);
    audioEngine.playStartChime();
  };

  const handleQuickAddRoutine = (category: CategoryType, title: string, durationMinutes: number) => {
    const slot = findNextAvailableSlot(selectedDate, durationMinutes);
    const end = addMinutesToTime(slot, durationMinutes);

    const newBlock: TimeBlock = {
      id: `tb-${Date.now()}`,
      title,
      category,
      priority: category === 'deep_work' ? 'high' : 'medium',
      date: selectedDate,
      startTime: slot,
      endTime: end,
      durationMinutes,
      completed: false,
      notes: 'Scheduled via Quick Routine Deploy',
      subtasks: [],
    };

    setBlocks(prev => [...prev, newBlock]);
    setActiveBlockId(newBlock.id);
    audioEngine.playStartChime();
  };

  // Category filter toggling
  const handleToggleCategory = (cat: CategoryType) => {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Soundscape toggling
  const handleSoundscapeChange = (type: SoundscapeType) => {
    setSoundscape(type);
    audioEngine.playSoundscape(type);
  };

  // Active block
  const activeBlock = blocks.find(b => b.id === activeBlockId) || null;

  // Today metrics
  const todayBlocks = blocks.filter(b => b.date === selectedDate);
  const todayCompletedCount = todayBlocks.filter(b => b.completed).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090D16] text-[#F8FAFC]">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCreateModal={() => {
          setCreateModalDate(selectedDate);
          setCreateModalSlotTime('10:00');
          setIsCreateModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onEnterChamber={() => setCurrentView('chamber')}
        soundscape={soundscape}
        onSoundscapeChange={handleSoundscapeChange}
        soundVolume={soundVolume}
        onSoundVolumeChange={setSoundVolume}
        todayCompletedCount={todayCompletedCount}
        todayTotalCount={todayBlocks.length}
      />

      {/* Main Orchestration Suite (3-Panel Desktop Layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Mini-Calendar, Velocity HUD, Routine Deploy, Backlog Queue */}
        <SidebarLeft
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          blocks={blocks}
          backlog={backlog}
          onAddBacklogTask={handleAddBacklogTask}
          onDeleteBacklogTask={handleDeleteBacklogTask}
          onScheduleBacklogTask={handleScheduleBacklogTask}
          activeCategories={activeCategories}
          onToggleCategory={handleToggleCategory}
          onQuickAddRoutine={handleQuickAddRoutine}
        />

        {/* Central Viewport: Timeline Canvas or Analytics */}
        {currentView === 'analytics' ? (
          <AnalyticsView blocks={blocks} selectedDate={selectedDate} />
        ) : (
          <TimelineCanvas
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            viewMode={currentView}
            blocks={blocks}
            activeBlockId={activeBlockId}
            onSelectBlock={id => setActiveBlockId(id)}
            onToggleComplete={handleToggleComplete}
            onSlotClick={handleSlotClick}
            activeCategories={activeCategories}
            onUpdateBlockTimes={(id, newStart, newEnd) => {
              const b = blocks.find(x => x.id === id);
              if (b) {
                const dur = timeToMinutes(newEnd) - timeToMinutes(newStart);
                handleUpdateBlock({ ...b, startTime: newStart, endTime: newEnd, durationMinutes: dur });
              }
            }}
          />
        )}

        {/* Right Docked Inspector & Precision Timer */}
        {currentView !== 'analytics' && (
          <SidebarRight
            block={activeBlock}
            onClose={() => setActiveBlockId(null)}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onDuplicateBlock={handleDuplicateBlock}
            onEnterChamber={() => setCurrentView('chamber')}
            soundscape={soundscape}
            onSoundscapeChange={handleSoundscapeChange}
          />
        )}
      </div>

      {/* Fullscreen Focus Chamber Overlay */}
      {currentView === 'chamber' && (
        <FocusChamber
          block={activeBlock}
          onExit={() => setCurrentView('1-day')}
          soundscape={soundscape}
          onSoundscapeChange={handleSoundscapeChange}
          soundVolume={soundVolume}
          onSoundVolumeChange={setSoundVolume}
          onCompleteBlock={id => {
            handleToggleComplete(id);
            setActiveBlockId(null);
          }}
        />
      )}

      {/* Create Block Modal */}
      <CreateBlockModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultDate={createModalDate}
        defaultTime={createModalSlotTime}
        onCreateBlock={handleCreateBlock}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        blocks={blocks}
        selectedDate={selectedDate}
      />
    </div>
  );
}
