import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Clock,
  Sparkles,
  AlertCircle,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { TimeBlock, TimelineViewMode, CategoryType } from '../types';
import { CATEGORIES } from '../data/initialData';
import { timeToMinutes, minutesToTime, formatDateLabel } from '../utils/timeUtils';
import { audioEngine } from '../utils/audioEngine';

interface TimelineCanvasProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  viewMode: TimelineViewMode;
  blocks: TimeBlock[];
  activeBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onToggleComplete: (blockId: string) => void;
  onSlotClick: (date: string, time: string) => void;
  activeCategories: CategoryType[];
  onUpdateBlockTimes: (blockId: string, newStart: string, newEnd: string) => void;
}

const START_HOUR = 6; // 06:00
const END_HOUR = 23; // 23:00
const TOTAL_HOURS = END_HOUR - START_HOUR + 1;

export const TimelineCanvas: React.FC<TimelineCanvasProps> = ({
  selectedDate,
  onSelectDate,
  viewMode,
  blocks,
  activeBlockId,
  onSelectBlock,
  onToggleComplete,
  onSlotClick,
  activeCategories,
  onUpdateBlockTimes,
}) => {
  const [pxPerHour, setPxPerHour] = useState(80); // 60, 80, 100
  const [nowMinute, setNowMinute] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update current time every 30 seconds for the Now Line
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Compute days to display based on viewMode
  const visibleDates = React.useMemo(() => {
    const baseDate = new Date(selectedDate + 'T00:00:00');
    if (viewMode === '1-day') {
      return [selectedDate];
    } else if (viewMode === '3-day') {
      return [-1, 0, 1].map(offset => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + offset);
        return d.toISOString().split('T')[0];
      });
    } else if (viewMode === '7-day') {
      // 7-day starting from selectedDate or Monday of week
      const dayOfWeek = baseDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + mondayOffset + i);
        return d.toISOString().split('T')[0];
      });
    }
    return [selectedDate];
  }, [selectedDate, viewMode]);

  // Generate 14-day date rail centered around current selection
  const railDates = React.useMemo(() => {
    const center = new Date(selectedDate + 'T00:00:00');
    return Array.from({ length: 15 }).map((_, i) => {
      const d = new Date(center);
      d.setDate(center.getDate() + (i - 7));
      return d.toISOString().split('T')[0];
    });
  }, [selectedDate]);

  // Scroll to current hour on initial load
  useEffect(() => {
    if (containerRef.current) {
      const currentMin = nowMinute - START_HOUR * 60;
      if (currentMin > 0) {
        const scrollTarget = (currentMin / 60) * pxPerHour - 160;
        containerRef.current.scrollTop = Math.max(0, scrollTarget);
      }
    }
  }, [pxPerHour]);

  // Position calculations
  const calculateBlockTop = (startTime: string) => {
    const mins = timeToMinutes(startTime);
    const startOffsetMins = mins - START_HOUR * 60;
    return (startOffsetMins / 60) * pxPerHour;
  };

  const calculateBlockHeight = (durationMins: number) => {
    return Math.max(28, (durationMins / 60) * pxPerHour);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isNowInView = nowMinute >= START_HOUR * 60 && nowMinute <= (END_HOUR + 1) * 60;
  const nowLineTop = ((nowMinute - START_HOUR * 60) / 60) * pxPerHour;

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onSelectDate(todayStr);
  };

  return (
    <main className="flex-1 flex flex-col h-full bg-[#090D16] overflow-hidden relative select-none">
      {/* Top Header Rail: Horizontal Date Selector & Precision Controls */}
      <div className="border-b border-[#222a3d] bg-[#0b1326] px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20">
        {/* Navigation & Today Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#131b2e] rounded-md border border-[#222a3d] p-0.5">
            <button
              onClick={handlePrevDay}
              className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1e293b] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-mono font-medium text-[#c3c0ff] hover:text-white hover:bg-[#1e293b] rounded transition-colors"
            >
              TODAY
            </button>
            <button
              onClick={handleNextDay}
              className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1e293b] transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-display font-medium text-[#F8FAFC] hidden sm:inline ml-1">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Horizontal Date Picker Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full md:max-w-md lg:max-w-xl">
          {railDates.map(date => {
            const { dayName, dayNumber, isToday } = formatDateLabel(date);
            const isSelected = selectedDate === date;

            return (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                className={`flex flex-col items-center justify-center min-w-[44px] h-[52px] rounded-lg border transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#4338CA] border-[#6366F1] text-white shadow-[0_0_16px_rgba(67,56,202,0.45)]'
                    : isToday
                    ? 'bg-[#131b2e] border-[#6366F1]/50 text-[#c3c0ff]'
                    : 'bg-[#131b2e] border-[#222a3d] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155]'
                }`}
              >
                <span className="text-[10px] font-mono tracking-wider font-semibold opacity-80">
                  {dayName}
                </span>
                <span className="text-sm font-display font-bold tabular-nums">
                  {dayNumber}
                </span>
                {isToday && (
                  <span className="w-1 h-1 rounded-full bg-[#10B981] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-[#131b2e] border border-[#222a3d] rounded-md p-0.5 self-end md:self-auto">
          <button
            onClick={() => setPxPerHour(prev => Math.max(50, prev - 15))}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1e293b]"
            title="Zoom Out (Compact)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono px-1.5 text-[#64748B] tabular-nums">
            {pxPerHour}px
          </span>
          <button
            onClick={() => setPxPerHour(prev => Math.min(120, prev + 15))}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1e293b]"
            title="Zoom In (Expanded)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPxPerHour(80)}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1e293b]"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Timeline Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-[#090D16]"
      >
        <div
          className="relative min-w-full"
          style={{ height: `${TOTAL_HOURS * pxPerHour + 40}px` }}
        >
          {/* Time axis left gutter */}
          <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-[#222a3d] bg-[#0b1326] z-10 select-none">
            {Array.from({ length: TOTAL_HOURS }).map((_, index) => {
              const hour = START_HOUR + index;
              const formattedHour = `${String(hour).padStart(2, '0')}:00`;

              return (
                <div
                  key={hour}
                  className="absolute right-2 -translate-y-2 text-right"
                  style={{ top: `${index * pxPerHour}px` }}
                >
                  <span className="text-[11px] font-mono font-medium text-[#64748B] tabular-nums">
                    {formattedHour}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid lines spanning the entire timeline */}
          <div className="absolute left-16 right-0 top-0 bottom-0 pointer-events-none">
            {Array.from({ length: TOTAL_HOURS }).map((_, index) => {
              const topPx = index * pxPerHour;
              return (
                <React.Fragment key={`grid-${index}`}>
                  {/* Full hour solid line */}
                  <div
                    className="absolute left-0 right-0 border-t border-[#1e293b]"
                    style={{ top: `${topPx}px` }}
                  />
                  {/* 30-minute dashed sub-line */}
                  <div
                    className="absolute left-0 right-0 border-t border-dashed border-[#171f33]"
                    style={{ top: `${topPx + pxPerHour / 2}px` }}
                  />
                  {/* 15 and 45 minute faint guides when zoom is comfortable */}
                  {pxPerHour >= 75 && (
                    <>
                      <div
                        className="absolute left-0 right-0 border-t border-dotted border-[#131b2e]"
                        style={{ top: `${topPx + pxPerHour / 4}px` }}
                      />
                      <div
                        className="absolute left-0 right-0 border-t border-dotted border-[#131b2e]"
                        style={{ top: `${topPx + (pxPerHour * 3) / 4}px` }}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Day Columns Container */}
          <div className="absolute left-16 right-0 top-0 bottom-0 flex">
            {visibleDates.map(date => {
              const isToday = date === todayStr;
              const dayBlocks = blocks.filter(
                b => b.date === date && activeCategories.includes(b.category)
              );

              return (
                <div
                  key={date}
                  className="flex-1 relative border-r border-[#1e293b] min-w-[240px]"
                  onClick={e => {
                    // Check if clicked directly on column background
                    if ((e.target as HTMLElement).closest('.time-block-card')) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const clickedMins = START_HOUR * 60 + Math.round((y / pxPerHour) * 60 / 15) * 15;
                    const slotTime = minutesToTime(clickedMins);
                    onSlotClick(date, slotTime);
                  }}
                >
                  {/* Column Header for multi-day views */}
                  {visibleDates.length > 1 && (
                    <div className="sticky top-0 z-10 bg-[#0b1326]/90 backdrop-blur-sm border-b border-[#222a3d] px-3 py-1 flex items-center justify-between text-xs font-mono">
                      <span className={isToday ? 'text-[#c3c0ff] font-bold' : 'text-[#94A3B8]'}>
                        {formatDateLabel(date).dayName} {formatDateLabel(date).dayNumber}
                      </span>
                      {isToday && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#4338CA] text-white">
                          TODAY
                        </span>
                      )}
                    </div>
                  )}

                  {/* REAL-TIME NOW LASER INDICATOR (Visible on Today's column) */}
                  {isToday && isNowInView && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                      style={{ top: `${nowLineTop}px` }}
                    >
                      {/* Laser node glowing circle */}
                      <div className="w-3.5 h-3.5 -ml-1.5 rounded-full bg-[#F43F5E] now-laser-node flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      {/* Laser beam with neon blur aura */}
                      <div className="h-[2px] flex-1 bg-[#F43F5E] now-laser-beam relative" />
                      <div className="pr-2 -mt-4 text-[10px] font-mono text-[#F43F5E] font-bold tracking-wider">
                        NOW
                      </div>
                    </div>
                  )}

                  {/* Render Time-Block Cards */}
                  {dayBlocks.map(block => {
                    const top = calculateBlockTop(block.startTime);
                    const height = calculateBlockHeight(block.durationMinutes);
                    const isSelected = activeBlockId === block.id;
                    const catConfig = CATEGORIES[block.category];
                    const completedSubtasks = block.subtasks.filter(st => st.completed).length;
                    const totalSubtasks = block.subtasks.length;

                    return (
                      <div
                        key={block.id}
                        onClick={e => {
                          e.stopPropagation();
                          onSelectBlock(block.id);
                        }}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          borderLeftColor: catConfig.color,
                        }}
                        className={`time-block-card absolute left-2 right-2 rounded-md border-l-[3.5px] p-2.5 transition-all cursor-pointer group flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? 'bg-[#1E293B] border-t border-r border-b border-[#6366F1]/50 shadow-[0_4px_24px_-2px_rgba(67,56,202,0.35)] ring-1 ring-[#6366F1]/60 z-20'
                            : 'bg-[#0F172A] border border-[#222a3d] hover:bg-[#171f33] hover:border-[#334155] z-10'
                        } ${block.completed ? 'opacity-65' : ''}`}
                      >
                        {/* Top row: Checkbox, Title, Time Range Badge */}
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              onToggleComplete(block.id);
                              audioEngine.playTick();
                            }}
                            className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-all ${
                              block.completed
                                ? 'bg-[#10B981] border-[#10B981] text-white'
                                : 'border-[#475569] hover:border-[#6366F1] bg-[#090D16]'
                            }`}
                          >
                            {block.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4
                                className={`text-xs font-display font-semibold truncate leading-tight ${
                                  block.completed ? 'line-through text-[#64748B]' : 'text-[#F8FAFC]'
                                }`}
                              >
                                {block.title}
                              </h4>
                              <span
                                className="font-mono text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 tabular-nums"
                                style={{
                                  backgroundColor: catConfig.bgTint,
                                  color: catConfig.textBadge,
                                }}
                              >
                                {block.startTime} - {block.endTime}
                              </span>
                            </div>

                            {/* Subtitle / Notes preview if height allows */}
                            {height >= 55 && block.notes && (
                              <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                                {block.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom row: Subtasks count, Category badge, Priority indicator */}
                        {height >= 50 && (
                          <div className="flex items-center justify-between pt-1 border-t border-[#222a3d]/50 mt-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[9px] font-mono uppercase tracking-wider font-semibold"
                                style={{ color: catConfig.textBadge }}
                              >
                                {catConfig.label}
                              </span>

                              {totalSubtasks > 0 && (
                                <span className="text-[10px] font-mono text-[#94A3B8] flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                  {completedSubtasks}/{totalSubtasks}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {block.priority === 'high' && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#F43F5E]/20 text-[#FDA4AF] border border-[#F43F5E]/30 font-semibold">
                                  P1
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-[#64748B]">
                                {block.durationMinutes}m
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
