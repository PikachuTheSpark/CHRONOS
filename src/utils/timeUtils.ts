import { TimeBlock } from '../types';

export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(minutes: number): string {
  const norm = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(timeStr: string, mins: number): string {
  const current = timeToMinutes(timeStr);
  return minutesToTime(current + mins);
}

export function calculateDuration(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return Math.max(15, end - start);
}

export function formatSecondsToTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatSecondsWithHours(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Convert date string YYYY-MM-DD to friendly human display
export function formatDateLabel(dateStr: string): { dayName: string; dayNumber: string; monthName: string; isToday: boolean } {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    dayName: days[d.getDay()],
    dayNumber: String(d.getDate()).padStart(2, '0'),
    monthName: months[d.getMonth()],
    isToday,
  };
}

// Export schedule to iCalendar standard format
export function generateICS(blocks: TimeBlock[]): string {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Chronos Precision Focus//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  blocks.forEach(block => {
    const cleanDate = block.date.replace(/-/g, '');
    const cleanStart = block.startTime.replace(':', '') + '00';
    const cleanEnd = block.endTime.replace(':', '') + '00';

    ics.push(
      'BEGIN:VEVENT',
      `UID:${block.id}@chronos.precision`,
      `DTSTAMP:${cleanDate}T000000Z`,
      `DTSTART:${cleanDate}T${cleanStart}`,
      `DTEND:${cleanDate}T${cleanEnd}`,
      `SUMMARY:${block.title}`,
      `DESCRIPTION:${(block.notes || '').replace(/\n/g, '\\n')}`,
      `CATEGORIES:${block.category.toUpperCase()}`,
      `STATUS:${block.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

// Export schedule to Markdown Day Planner
export function generateMarkdown(blocks: TimeBlock[], dateStr: string): string {
  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  let md = `# Chronos Precision Focus Planner - ${dateStr}\n\n`;
  md += `| Time Window | Status | Category | Mission Title | Duration |\n`;
  md += `| :--- | :---: | :--- | :--- | :---: |\n`;

  sorted.forEach(b => {
    const status = b.completed ? '[x]' : '[ ]';
    md += `| ${b.startTime} - ${b.endTime} | ${status} | ${b.category} | ${b.title} | ${b.durationMinutes}m |\n`;
  });

  md += `\n### Task Notes & Checklists\n`;
  sorted.forEach(b => {
    if (b.notes || (b.subtasks && b.subtasks.length > 0)) {
      md += `\n#### ${b.startTime} - ${b.title}\n`;
      if (b.notes) md += `> ${b.notes}\n\n`;
      if (b.subtasks && b.subtasks.length > 0) {
        b.subtasks.forEach(st => {
          md += `- [${st.completed ? 'x' : ' '}] ${st.text}\n`;
        });
      }
    }
  });

  return md;
}
