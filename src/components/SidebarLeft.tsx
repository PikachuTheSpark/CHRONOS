import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Flame,
  Zap,
  Clock,
  ArrowRightCircle,
  Trash2,
  Cpu,
  Users,
  FileCheck2,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { CategoryType, TimeBlock, BacklogTask, PriorityType } from '../types';
import { CATEGORIES } from '../data/initialData';

interface SidebarLeftProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  blocks: TimeBlock[];
  backlog: BacklogTask[];
  onAddBacklogTask: (task: BacklogTask) => void;
  onDeleteBacklogTask: (id: string) => void;
  onScheduleBacklogTask: (task: BacklogTask) => void;
  activeCategories: CategoryType[];
  onToggleCategory: (cat: CategoryType) => void;
  onQuickAddRoutine: (category: CategoryType, title: string, durationMinutes: number) => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  selectedDate,
  onSelectDate,
  blocks,
  backlog,
  onAddBacklogTask,
  onDeleteBacklogTask,
  onScheduleBacklogTask,
  activeCategories,
  onToggleCategory,
  onQuickAddRoutine,
}) => {
  // Calendar internal navigation state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date(selectedDate + 'T00:00:00'));
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<CategoryType>('deep_work');
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityType>('high');
  const [showAddForm, setShowAddForm] = useState(false);

  // Calendar rendering calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDayClick = (day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(formatted);
  };

  const handleCreateBacklog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: BacklogTask = {
      id: `bt-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      estimatedMinutes: newTaskDuration,
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
      subtasks: [],
    };
    onAddBacklogTask(task);
    setNewTaskTitle('');
    setShowAddForm(false);
  };

  // Metrics for today
  const todayBlocks = blocks.filter(b => b.date === selectedDate);
  const deepWorkMinutes = todayBlocks
    .filter(b => b.category === 'deep_work')
    .reduce((acc, b) => acc + b.durationMinutes, 0);
  const deepWorkHours = (deepWorkMinutes / 60).toFixed(1);

  return (
    <aside className="w-full lg:w-72 xl:w-80 border-r border-[#222a3d] bg-[#0b1326] flex flex-col h-full overflow-y-auto shrink-0 select-none">
      {/* Mini-Calendar Panel */}
      <div className="p-4 border-b border-[#222a3d]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-display font-medium text-[#F8FAFC]">
            <CalendarIcon className="w-4 h-4 text-[#c3c0ff]" />
            <span>{monthName} {year}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded hover:bg-[#1e293b] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 rounded hover:bg-[#1e293b] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-mono text-[#64748B] mb-2 font-medium">
          <span>SU</span>
          <span>MO</span>
          <span>TU</span>
          <span>WE</span>
          <span>TH</span>
          <span>FR</span>
          <span>SA</span>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;
            const isToday = todayStr === dateStr;
            const hasEvents = blocks.some(b => b.date === dateStr);

            return (
              <button
                key={`day-${day}`}
                onClick={() => handleDayClick(day)}
                className={`h-7 w-7 rounded flex flex-col items-center justify-center font-mono text-xs relative transition-all ${
                  isSelected
                    ? 'bg-[#4338CA] text-white font-bold shadow-[0_0_10px_rgba(67,56,202,0.6)]'
                    : isToday
                    ? 'border border-[#6366F1] text-[#c3c0ff] font-semibold'
                    : 'text-[#94A3B8] hover:bg-[#171f33] hover:text-[#F8FAFC]'
                }`}
              >
                <span>{day}</span>
                {hasEvents && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-[#38BDF8] absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus Velocity HUD */}
      <div className="p-4 border-b border-[#222a3d] bg-[#0d152a]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            Cognitive Velocity
          </span>
          <div className="flex items-center gap-1 text-xs font-mono font-medium text-[#F43F5E]">
            <Flame className="w-3.5 h-3.5 fill-[#F43F5E]" />
            <span>14d streak</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2.5 rounded-md bg-[#131b2e] border border-[#222a3d]">
            <span className="text-[10px] text-[#94A3B8] font-mono block">Deep Work</span>
            <span className="text-base font-display font-semibold text-[#c3c0ff] tabular-nums">
              {deepWorkHours}h <span className="text-xs text-[#64748B] font-normal">/ 5h</span>
            </span>
          </div>
          <div className="p-2.5 rounded-md bg-[#131b2e] border border-[#222a3d]">
            <span className="text-[10px] text-[#94A3B8] font-mono block">Efficiency</span>
            <span className="text-base font-display font-semibold text-[#10B981] tabular-nums">
              94%
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="p-4 border-b border-[#222a3d]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Categories
          </span>
          <span className="text-[10px] text-[#64748B] font-mono">Filter Timeline</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {(Object.keys(CATEGORIES) as CategoryType[]).map(catKey => {
            const config = CATEGORIES[catKey];
            const isActive = activeCategories.includes(catKey);
            const count = todayBlocks.filter(b => b.category === catKey).length;

            return (
              <button
                key={catKey}
                onClick={() => onToggleCategory(catKey)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all border ${
                  isActive
                    ? 'bg-[#171f33] border-[#334155] text-[#F8FAFC]'
                    : 'bg-transparent border-transparent text-[#64748B] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#0b1326] text-[#94A3B8]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine Quick-Deploy Templates */}
      <div className="p-4 border-b border-[#222a3d]">
        <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] mb-2.5 block">
          Quick Routine Deploy
        </span>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            onClick={() => onQuickAddRoutine('deep_work', 'Deep Focus Sprint', 90)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] text-left text-xs text-[#c3c0ff] transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#6366F1]" />
              <span>+ 90m Deep Focus</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B] group-hover:text-[#F8FAFC]">Auto-slot</span>
          </button>

          <button
            onClick={() => onQuickAddRoutine('meeting', 'Sync & Alignment', 30)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] text-left text-xs text-[#89ceff] transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span>+ 30m Team Sync</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B] group-hover:text-[#F8FAFC]">Auto-slot</span>
          </button>

          <button
            onClick={() => onQuickAddRoutine('review', 'Code & Arch Review', 45)}
            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] text-left text-xs text-[#FDE68A] transition-all group"
          >
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>+ 45m Code Review</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B] group-hover:text-[#F8FAFC]">Auto-slot</span>
          </button>
        </div>
      </div>

      {/* Task Queue / Backlog */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
              Mission Backlog
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#171f33] text-[#c3c0ff]">
              {backlog.length}
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1 rounded hover:bg-[#171f33] text-[#89ceff] hover:text-white transition-colors"
            title="Add task to backlog"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick add backlog form */}
        {showAddForm && (
          <form onSubmit={handleCreateBacklog} className="mb-3 p-2.5 rounded-md bg-[#131b2e] border border-[#2d3449] space-y-2">
            <input
              type="text"
              placeholder="Task mission name..."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full text-xs bg-[#0b1326] border border-[#222a3d] rounded px-2 py-1.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#6366F1]"
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={newTaskCategory}
                onChange={e => setNewTaskCategory(e.target.value as CategoryType)}
                className="text-[11px] bg-[#0b1326] border border-[#222a3d] rounded px-2 py-1 text-[#94A3B8]"
              >
                <option value="deep_work">Deep Work</option>
                <option value="meeting">Meeting</option>
                <option value="review">Review</option>
                <option value="urgent">Urgent</option>
                <option value="buffer">Buffer</option>
              </select>

              <select
                value={newTaskDuration}
                onChange={e => setNewTaskDuration(Number(e.target.value))}
                className="text-[11px] bg-[#0b1326] border border-[#222a3d] rounded px-2 py-1 text-[#94A3B8] font-mono"
              >
                <option value={15}>15m</option>
                <option value={30}>30m</option>
                <option value={45}>45m</option>
                <option value={60}>60m</option>
                <option value={90}>90m</option>
                <option value={120}>120m</option>
              </select>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 text-[11px] text-[#94A3B8] hover:text-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 text-[11px] bg-[#4338CA] hover:bg-[#4F46E5] text-white rounded font-medium"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Backlog List */}
        <div className="space-y-2 flex-1">
          {backlog.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#64748B]">
              Backlog queue is empty.
            </div>
          ) : (
            backlog.map(task => {
              const catConfig = CATEGORIES[task.category];
              return (
                <div
                  key={task.id}
                  className="p-2.5 rounded-md bg-[#131b2e] border border-[#222a3d] hover:border-[#334155] transition-all group flex flex-col gap-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-medium text-[#F8FAFC] leading-snug line-clamp-2">
                      {task.title}
                    </span>
                    <button
                      onClick={() => onDeleteBacklogTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#64748B] hover:text-[#F43F5E] transition-opacity"
                      title="Remove task"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: catConfig.color }}
                      />
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {task.estimatedMinutes}m
                      </span>
                    </div>

                    <button
                      onClick={() => onScheduleBacklogTask(task)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#171f33] hover:bg-[#4338CA] text-[#c3c0ff] hover:text-white text-[11px] font-mono transition-colors border border-[#2d3449]"
                      title="Schedule into next free timeline slot today"
                    >
                      <span>Slot</span>
                      <ArrowRightCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
