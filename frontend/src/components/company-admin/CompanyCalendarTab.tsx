import React, { useState, useMemo } from 'react';
import { User, AttendanceRecord, Batch } from '../../types';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Sparkles,
  RotateCcw,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';

interface CompanyCalendarTabProps {
  currentBatch: Batch;
  activeBatchId: string;
  batchUsers: User[];
  attendanceRecords: AttendanceRecord[];
  selectedCalendarDate: string;
  setSelectedCalendarDate: (date: string) => void;
  onViewReport: (user: User) => void;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const CompanyCalendarTab: React.FC<CompanyCalendarTabProps> = ({
  currentBatch,
  activeBatchId,
  batchUsers,
  attendanceRecords,
  selectedCalendarDate,
  setSelectedCalendarDate,
  onViewReport,
}) => {
  // Parse initial year and month safely
  const initialYear = selectedCalendarDate
    ? parseInt(selectedCalendarDate.split('-')[0], 10) || 2026
    : 2026;
  const initialMonth = selectedCalendarDate
    ? (parseInt(selectedCalendarDate.split('-')[1], 10) - 1) || 9
    : 9;

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedDates, setSelectedDates] = useState<string[]>([
    selectedCalendarDate || '2026-10-04',
  ]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [activeDateFilter, setActiveDateFilter] = useState<string>('all');

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Jump to today
  const handleSelectToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const dStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setCurrentYear(y);
    setCurrentMonth(m);
    setSelectedDates([dStr]);
    setSelectedCalendarDate(dStr);
  };

  // Select all days in month that have recorded attendance sessions
  const handleSelectAllCallDays = () => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const prefix = `${currentYear}-${monthStr}`;
    const callDays = attendanceRecords
      .filter((r) => r.batchId === activeBatchId && r.date.startsWith(prefix))
      .map((r) => r.date);
    const uniqueDays = Array.from(new Set(callDays)).sort();

    if (uniqueDays.length > 0) {
      setIsMultiSelectMode(true);
      setSelectedDates(uniqueDays);
      setSelectedCalendarDate(uniqueDays[0]);
    }
  };

  // Click on date cell
  const handleDateClick = (dateStr: string) => {
    if (isMultiSelectMode) {
      if (selectedDates.includes(dateStr)) {
        if (selectedDates.length > 1) {
          const next = selectedDates.filter((d) => d !== dateStr);
          setSelectedDates(next);
          setSelectedCalendarDate(next[0]);
        }
      } else {
        const next = [...selectedDates, dateStr].sort();
        setSelectedDates(next);
        setSelectedCalendarDate(dateStr);
      }
    } else {
      setSelectedDates([dateStr]);
      setSelectedCalendarDate(dateStr);
    }
  };

  // Calendar math
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Filler days for preceding month
  const prevMonthPadding = Array.from({ length: startDayOfWeek }, (_, i) => {
    return daysInPrevMonth - startDayOfWeek + 1 + i;
  });

  // Trailing days for grid completion (multiple of 7)
  const totalOccupied = startDayOfWeek + daysInMonth;
  const trailingDaysCount = totalOccupied % 7 === 0 ? 0 : 7 - (totalOccupied % 7);
  const nextMonthPadding = Array.from({ length: trailingDaysCount }, (_, i) => i + 1);

  // Today ISO string
  const todayObj = new Date();
  const todayISO = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(
    todayObj.getDate()
  ).padStart(2, '0')}`;

  // Filter attendance records for selected dates
  const effectiveDatesToDisplay = useMemo(() => {
    if (activeDateFilter !== 'all' && selectedDates.includes(activeDateFilter)) {
      return [activeDateFilter];
    }
    return selectedDates;
  }, [activeDateFilter, selectedDates]);

  // Build rows for session log table
  const sessionLogRows = useMemo(() => {
    const rows: {
      user: User;
      date: string;
      rec?: AttendanceRecord;
      isPresent: boolean;
      minutes: number;
    }[] = [];

    effectiveDatesToDisplay.forEach((dStr) => {
      batchUsers.forEach((u) => {
        const rec = attendanceRecords.find(
          (r) => r.batchId === activeBatchId && r.date === dStr && r.userId === u.id
        );
        const isPresent = rec?.status === 'present';
        const minutes = rec?.minutesPresent || 0;

        if (statusFilter === 'present' && !isPresent) return;
        if (statusFilter === 'absent' && isPresent) return;

        rows.push({
          user: u,
          date: dStr,
          rec,
          isPresent,
          minutes,
        });
      });
    });

    return rows;
  }, [effectiveDatesToDisplay, batchUsers, attendanceRecords, activeBatchId, statusFilter]);

  // Aggregate stats across effective selected dates
  const stats = useMemo(() => {
    let presentCount = 0;
    let absentCount = 0;
    let totalMinutes = 0;

    effectiveDatesToDisplay.forEach((dStr) => {
      batchUsers.forEach((u) => {
        const rec = attendanceRecords.find(
          (r) => r.batchId === activeBatchId && r.date === dStr && r.userId === u.id
        );
        if (rec?.status === 'present') {
          presentCount++;
          totalMinutes += rec.minutesPresent || 0;
        } else {
          absentCount++;
        }
      });
    });

    const total = presentCount + absentCount;
    const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

    return { presentCount, absentCount, total, rate, totalMinutes };
  }, [effectiveDatesToDisplay, batchUsers, attendanceRecords, activeBatchId]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1 border border-blue-200">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Interactive Attendance Hub</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Attendance Tracking & Session Audits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full-size monthly calendar. Jump across years & months, multi-select dates to inspect attendance, and export official participant session records.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            Batch: {currentBatch.code} ({currentBatch.name})
          </span>
        </div>
      </div>

      {/* FULL-WIDTH EXPANDED CALENDAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        {/* Calendar Navigation & Mode Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Month & Year Selectors with Prev/Next Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month Dropdown */}
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value, 10))}
                className="bg-transparent text-sm font-bold text-slate-800 px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-sm font-bold text-slate-800 px-2 py-1 focus:outline-none cursor-pointer border-l border-slate-200"
              >
                {YEAR_OPTIONS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleSelectToday}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Selection Mode & Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Single vs Multi-Date mode */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => {
                  setIsMultiSelectMode(false);
                  if (selectedDates.length > 1) {
                    setSelectedDates([selectedDates[0]]);
                    setSelectedCalendarDate(selectedDates[0]);
                  }
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  !isMultiSelectMode
                    ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Single Date
              </button>
              <button
                onClick={() => setIsMultiSelectMode(true)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 ${
                  isMultiSelectMode
                    ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Multi-Date Select</span>
              </button>
            </div>

            {/* Quick Action: Select All Call Days */}
            <button
              onClick={handleSelectAllCallDays}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Select Call Days</span>
            </button>

            {selectedDates.length > 1 && (
              <button
                onClick={() => {
                  const defaultD = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-04`;
                  setSelectedDates([defaultD]);
                  setSelectedCalendarDate(defaultD);
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                title="Reset selection"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Dates Pill Badges Tray */}
        {selectedDates.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-xs">
            <span className="font-bold text-blue-900 flex items-center space-x-1 mr-1">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Selected ({selectedDates.length}):</span>
            </span>
            {selectedDates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200 font-bold shadow-2xs"
              >
                <span>{d}</span>
                {selectedDates.length > 1 && (
                  <button
                    onClick={() => handleDateClick(d)}
                    className="hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                    title="Remove date"
                  >
                    &times;
                  </button>
                )}
              </span>
            ))}
            {isMultiSelectMode && (
              <span className="text-[11px] text-blue-600 font-medium ml-2">
                Click any calendar tile to toggle selection
              </span>
            )}
          </div>
        )}

        {/* Weekday Header Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2 bg-slate-50 rounded-xl border border-slate-100">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Calendar Days Matrix (Full Size) */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous Month's Days (Trailing) */}
          {prevMonthPadding.map((dayNum) => (
            <div
              key={`prev-${dayNum}`}
              className="min-h-[78px] rounded-xl p-2 bg-slate-50/40 border border-dashed border-slate-200 text-slate-300 flex flex-col justify-between select-none"
            >
              <span className="text-xs font-semibold">{dayNum}</span>
            </div>
          ))}

          {/* Current Month Active Days */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${
              day < 10 ? '0' + day : day
            }`;
            const recordsForDay = attendanceRecords.filter(
              (r) => r.batchId === activeBatchId && r.date === dateStr
            );
            const isSelected = selectedDates.includes(dateStr);
            const isToday = dateStr === todayISO;
            const hasCall = recordsForDay.length > 0;
            const hasAbsence = recordsForDay.some((r) => r.status === 'absent');
            const presentCount = recordsForDay.filter((r) => r.status === 'present').length;

            return (
              <button
                key={day}
                onClick={() => handleDateClick(dateStr)}
                className={`min-h-[78px] rounded-xl p-2.5 text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-sm'
                    : isToday
                    ? 'bg-blue-50/40 border-2 border-blue-400 text-slate-900 hover:bg-blue-50'
                    : hasCall
                    ? hasAbsence
                      ? 'bg-amber-50/70 border border-amber-200 hover:bg-amber-100/70 text-slate-900'
                      : 'bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-100/70 text-slate-900'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                }`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-sm font-extrabold ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'text-blue-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {day}
                  </span>

                  {isToday && !isSelected && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-blue-600 text-white font-extrabold">
                      Today
                    </span>
                  )}

                  {isSelected && (
                    <span className="text-[10px] text-white/90 font-bold">
                      &#10003;
                    </span>
                  )}
                </div>

                {/* Day Session Indicators */}
                <div className="mt-1 space-y-1">
                  {hasCall ? (
                    <div
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center justify-between ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : hasAbsence
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      <span>{hasAbsence ? 'Absences' : 'Full Session'}</span>
                      <span className="text-[9px] font-extrabold">
                        {presentCount}/{recordsForDay.length}
                      </span>
                    </div>
                  ) : (
                    <div className="h-4"></div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Next Month's Days (Trailing) */}
          {nextMonthPadding.map((dayNum) => (
            <div
              key={`next-${dayNum}`}
              className="min-h-[78px] rounded-xl p-2 bg-slate-50/40 border border-dashed border-slate-200 text-slate-300 flex flex-col justify-between select-none"
            >
              <span className="text-xs font-semibold">{dayNum}</span>
            </div>
          ))}
        </div>

        {/* Legend Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span className="font-medium">Full Presence</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500"></span>
              <span className="font-medium">Partial / Absences</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600"></span>
              <span className="font-medium">Selected Date(s)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md border-2 border-blue-400 bg-blue-50"></span>
              <span className="font-medium">Today</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Total Batch Members: {batchUsers.length} Users
          </span>
        </div>
      </div>

      {/* COMPACT BOTTOM SECTION: SESSION LOG DETAILS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        {/* Section Header with Aggregated KPIs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-slate-900 text-base">
                Session Log Details
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800">
                {selectedDates.length === 1
                  ? selectedDates[0]
                  : `${selectedDates.length} Dates Selected`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Who attended the sessions, minute-level active durations, and individual analysis reports.
            </p>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Total Logs</span>
              <span className="text-xs font-black text-slate-800">{stats.total}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-700 font-semibold block uppercase">Present</span>
              <span className="text-xs font-black text-emerald-800">{stats.presentCount}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
              <span className="text-[10px] text-rose-700 font-semibold block uppercase">Absent</span>
              <span className="text-xs font-black text-rose-800">{stats.absentCount}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] text-blue-700 font-semibold block uppercase">Attendance Rate</span>
              <span className="text-xs font-black text-blue-800">{stats.rate}%</span>
            </div>
          </div>
        </div>

        {/* Multi-Date Filter Pills (Visible when more than 1 date is selected) */}
        {selectedDates.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="text-xs font-bold text-slate-600 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter by Date:</span>
            </span>
            <button
              onClick={() => setActiveDateFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeDateFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Selected ({selectedDates.length})
            </button>
            {selectedDates.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDateFilter(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeDateFilter === d
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Attendees ({batchUsers.length * effectiveDatesToDisplay.length})
          </button>
          <button
            onClick={() => setStatusFilter('present')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'present'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Present ({stats.presentCount})
          </button>
          <button
            onClick={() => setStatusFilter('absent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'absent'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Absent ({stats.absentCount})
          </button>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Role</th>
                {effectiveDatesToDisplay.length > 1 && (
                  <th className="py-3 px-4">Session Date</th>
                )}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Minutes on Call</th>
                <th className="py-3 px-4 text-right">Detailed Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sessionLogRows.length > 0 ? (
                sessionLogRows.map((row, idx) => {
                  const { user, date, rec, isPresent, minutes } = row;
                  return (
                    <tr key={`${user.id}-${date}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>

                      {effectiveDatesToDisplay.length > 1 && (
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {date}
                        </td>
                      )}

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 shrink-0" />
                          )}
                          <span>{isPresent ? 'Present' : 'Absent'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">
                            {rec ? `${minutes} minutes` : 'No session record'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewReport(user)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Analysis Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={effectiveDatesToDisplay.length > 1 ? 6 : 5}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    No participants matched the filter criteria for the selected date(s).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
