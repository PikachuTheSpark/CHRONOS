import React, { useState } from 'react';
import { X, Download, Copy, Check, Calendar, FileText, Code2 } from 'lucide-react';
import { TimeBlock } from '../types';
import { generateICS, generateMarkdown } from '../utils/timeUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blocks: TimeBlock[];
  selectedDate: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blocks,
  selectedDate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const dayBlocks = blocks.filter(b => b.date === selectedDate);
  const markdownContent = generateMarkdown(dayBlocks, selectedDate);
  const icsContent = generateICS(blocks);

  const handleDownloadICS = () => {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chronos-schedule-${selectedDate}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(blocks, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `chronos-backup-${selectedDate}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0F172A] border border-[#2d3449] w-full max-w-lg rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#222a3d] flex items-center justify-between bg-[#0b1326]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#c3c0ff]" />
            <h3 className="text-sm font-display font-semibold text-[#F8FAFC]">
              Export Temporal Schedule
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#94A3B8] hover:text-white hover:bg-[#1e293b]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-[#94A3B8]">
            Export your precision time-blocks to your calendar client, daily engineering logs, or portable backups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleDownloadICS}
              className="p-3 rounded-lg bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] hover:border-[#6366F1]/50 text-left transition-all group flex flex-col justify-between"
            >
              <Calendar className="w-5 h-5 text-[#89ceff] mb-2" />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">iCalendar (.ics)</span>
                <span className="text-[10px] text-[#64748B]">Google, Apple, Outlook</span>
              </div>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="p-3 rounded-lg bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] hover:border-[#6366F1]/50 text-left transition-all group flex flex-col justify-between"
            >
              {copied ? (
                <Check className="w-5 h-5 text-[#10B981] mb-2" />
              ) : (
                <FileText className="w-5 h-5 text-[#c3c0ff] mb-2" />
              )}
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">
                  {copied ? 'Copied!' : 'Copy Markdown'}
                </span>
                <span className="text-[10px] text-[#64748B]">Obsidian & Notion</span>
              </div>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="p-3 rounded-lg bg-[#131b2e] hover:bg-[#1a243c] border border-[#222a3d] hover:border-[#6366F1]/50 text-left transition-all group flex flex-col justify-between"
            >
              <Code2 className="w-5 h-5 text-[#F59E0B] mb-2" />
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC] block">JSON Backup</span>
                <span className="text-[10px] text-[#64748B]">Full State Snapshot</span>
              </div>
            </button>
          </div>

          {/* Preview Box */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1.5">
              Markdown Log Preview ({selectedDate})
            </span>
            <div className="bg-[#0b1326] border border-[#222a3d] rounded-md p-3 max-h-48 overflow-y-auto">
              <pre className="text-[11px] font-mono text-[#94A3B8] whitespace-pre-wrap">
                {markdownContent}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#222a3d]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#94A3B8] hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
