import React from 'react';
import {
  BarChart3,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  PieChart,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { TimeBlock, CategoryType } from '../types';
import { CATEGORIES } from '../data/initialData';
import { timeToMinutes } from '../utils/timeUtils';

interface AnalyticsViewProps {
  blocks: TimeBlock[];
  selectedDate: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ blocks, selectedDate }) => {
  // Aggregate stats
  const dateBlocks = blocks.filter(b => b.date === selectedDate);
  const totalMinutes = dateBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const completedBlocks = dateBlocks.filter(b => b.completed);
  const completionRate = dateBlocks.length > 0 ? Math.round((completedBlocks.length / dateBlocks.length) * 100) : 0;

  // Category distribution
  const categoryMinutes: Record<CategoryType, number> = {
    deep_work: 0,
    meeting: 0,
    review: 0,
    urgent: 0,
    buffer: 0,
  };

  dateBlocks.forEach(b => {
    categoryMinutes[b.category] = (categoryMinutes[b.category] || 0) + b.durationMinutes;
  });

  const deepWorkMinutes = categoryMinutes.deep_work || 0;
  const deepRatio = totalMinutes > 0 ? Math.round((deepWorkMinutes / totalMinutes) * 100) : 0;

  // Hourly allocation histogram (06:00 to 22:00)
  const hourlyDensity = Array.from({ length: 16 }).map((_, i) => {
    const hour = 6 + i;
    const hourStartMin = hour * 60;
    const hourEndMin = (hour + 1) * 60;

    const blocksInHour = dateBlocks.filter(b => {
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return Math.max(hourStartMin, bStart) < Math.min(hourEndMin, bEnd);
    });

    return {
      hour: `${String(hour).padStart(2, '0')}:00`,
      count: blocksInHour.length,
      category: blocksInHour[0]?.category || null,
    };
  });

  return (
    <div className="flex-1 bg-[#090D16] p-6 md:p-8 overflow-y-auto select-none space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#222a3d] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#c3c0ff]" />
            <h2 className="text-xl font-display font-bold text-[#F8FAFC]">
              Chrono-Audit & Cognitive Velocity
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            Precision temporal distribution analysis for {selectedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-md bg-[#131b2e] border border-[#222a3d] flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#F43F5E] fill-[#F43F5E]" />
            <span className="text-xs font-mono font-semibold text-[#F8FAFC]">
              14 Days Discipline Streak
            </span>
          </div>
        </div>
      </div>

      {/* Core KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono uppercase mb-2">
            <span>Total Time Allocated</span>
            <Clock className="w-4 h-4 text-[#89ceff]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F8FAFC] tabular-nums">
            {(totalMinutes / 60).toFixed(1)} <span className="text-sm font-normal text-[#64748B]">hours</span>
          </div>
          <div className="text-[11px] font-mono text-[#10B981] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Optimal 8h capacity target</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono uppercase mb-2">
            <span>Deep Work Density</span>
            <Zap className="w-4 h-4 text-[#c3c0ff]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#c3c0ff] tabular-nums">
            {deepRatio}% <span className="text-sm font-normal text-[#64748B]">({(deepWorkMinutes / 60).toFixed(1)}h)</span>
          </div>
          <div className="text-[11px] font-mono text-[#c3c0ff] mt-1">
            Target threshold: &gt;50%
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono uppercase mb-2">
            <span>Execution Integrity</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#10B981] tabular-nums">
            {completionRate}%
          </div>
          <div className="text-[11px] font-mono text-[#94A3B8] mt-1">
            {completedBlocks.length} of {dateBlocks.length} blocks completed
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs font-mono uppercase mb-2">
            <span>Fragmentation Index</span>
            <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F59E0B] tabular-nums">
            Low (1.2)
          </div>
          <div className="text-[11px] font-mono text-[#94A3B8] mt-1">
            Context switching minimized
          </div>
        </div>
      </div>

      {/* Category Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Card */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <h3 className="text-sm font-display font-semibold text-[#F8FAFC] mb-4 flex items-center justify-between">
            <span>Category Temporal Distribution</span>
            <span className="text-xs font-mono text-[#64748B]">Minutes Planned</span>
          </h3>

          <div className="space-y-3">
            {(Object.keys(CATEGORIES) as CategoryType[]).map(catKey => {
              const conf = CATEGORIES[catKey];
              const mins = categoryMinutes[catKey] || 0;
              const pct = totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0;

              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-[#F8FAFC]">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: conf.color }}
                      />
                      {conf.label}
                    </span>
                    <span className="font-mono text-[#94A3B8]">
                      {mins}m <span className="text-[#64748B]">({pct}%)</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[#060e20] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: conf.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Commitments Matrix */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-[#222a3d]">
          <h3 className="text-sm font-display font-semibold text-[#F8FAFC] mb-4 flex items-center justify-between">
            <span>Hourly Cognitive Load Profile</span>
            <span className="text-xs font-mono text-[#64748B]">06:00 - 22:00</span>
          </h3>

          <div className="grid grid-cols-8 gap-2">
            {hourlyDensity.map(item => {
              const hasActivity = item.count > 0;
              const catConf = item.category ? CATEGORIES[item.category] : null;

              return (
                <div
                  key={item.hour}
                  className={`p-2 rounded-md border flex flex-col items-center justify-center transition-all ${
                    hasActivity
                      ? 'bg-[#171f33] border-[#4338CA]/40 shadow-[0_0_10px_rgba(67,56,202,0.2)]'
                      : 'bg-[#060e20] border-[#1e293b] opacity-40'
                  }`}
                >
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    {item.hour.split(':')[0]}h
                  </span>
                  <div
                    className="w-3 h-3 rounded-full mt-1.5"
                    style={{
                      backgroundColor: catConf ? catConf.color : '#334155',
                    }}
                  />
                  <span className="text-[9px] font-mono text-[#64748B] mt-1">
                    {item.count > 0 ? `${item.count} blk` : '-'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded bg-[#131b2e] border border-[#222a3d] text-xs text-[#94A3B8] flex items-start gap-2.5">
            <ArrowUpRight className="w-4 h-4 text-[#c3c0ff] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[#F8FAFC]">Chrono-Audit Insight:</strong> High-bandwidth deep work blocks are successfully clustered in the morning hours (09:00 - 11:30), protecting peak circadian cognitive clarity before synchronous meetings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
