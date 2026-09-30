import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Flame, Calendar, Dumbbell, Award, Save, RefreshCw, Trophy } from 'lucide-react';

interface DayProgress {
  dayNumber: number;
  title: string;
  focus: string;
  completed: boolean;
  notes: string;
}

const INITIAL_DAYS: DayProgress[] = [
  { dayNumber: 1, title: "Day 1", focus: "Upper Body Strength & Core", completed: true, notes: "Bench 4x8 @ 80kg, Row 4x10 @ 65kg. Strong start!" },
  { dayNumber: 2, title: "Day 2", focus: "Lower Body Foundation & Quads", completed: true, notes: "Squats felt clean. Kept rest to 90 seconds." },
  { dayNumber: 3, title: "Day 3", focus: "Active Recovery & Mobility Flow", completed: false, notes: "45 min brisk walk & 15 mins yoga." },
  { dayNumber: 4, title: "Day 4", focus: "Pull & Posterior Chain Emphasis", completed: false, notes: "" },
  { dayNumber: 5, title: "Day 5", focus: "Push & Lower Body Metabolic Circuit", completed: false, notes: "" },
  { dayNumber: 6, title: "Day 6", focus: "Core Specialization & HIIT Interval", completed: false, notes: "" },
  { dayNumber: 7, title: "Day 7", focus: "Rest, Muscle Recharge & Meal Prep", completed: false, notes: "" },
];

export const ProgressTrackerView: React.FC = () => {
  const [days, setDays] = useState<DayProgress[]>(INITIAL_DAYS);
  const [userId, setUserId] = useState(101);
  const [streak, setStreak] = useState(2);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate stats
  const completedCount = days.filter((d) => d.completed).length;
  const progressPercent = Math.round((completedCount / days.length) * 100);

  const toggleDay = (dayNum: number) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber === dayNum) {
          return { ...d, completed: !d.completed };
        }
        return d;
      })
    );
  };

  const updateNotes = (dayNum: number, newNotes: string) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.dayNumber === dayNum) {
          return { ...d, notes: newNotes };
        }
        return d;
      })
    );
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const completedDays = days.filter((d) => d.completed).map((d) => d.dayNumber);
      const notesMap: Record<number, string> = {};
      days.forEach((d) => {
        if (d.notes) notesMap[d.dayNumber] = d.notes;
      });

      await fetch(`/api/progress/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedDays,
          notes: notesMap,
          streak: completedDays.length,
        }),
      });

      setStreak(completedDays.length);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>FitBuddy Workout Progress Tracker</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Monitor your 7-day routine, log exercise notes, and maintain consistency streaks.
          </p>
        </div>

        <button
          onClick={handleSaveProgress}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Saving..." : saveSuccess ? "Saved to SQLite!" : "Save Progress"}</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak */}
        <div className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-85 block">
              Active Streak
            </span>
            <span className="text-3xl font-black tracking-tight">{streak} Days</span>
            <p className="text-xs opacity-90 mt-1">Keep training consistently!</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Flame className="w-7 h-7 fill-current" />
          </div>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider opacity-85 block">
              Weekly Progress
            </span>
            <span className="text-3xl font-black tracking-tight">{progressPercent}%</span>
            <p className="text-xs opacity-90 mt-1">
              {completedCount} of 7 days completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
              Tracking Athlete
            </span>
            <span className="text-lg font-bold text-slate-900 block">Alex Rivera</span>
            <span className="text-xs font-mono text-blue-600 font-semibold">User ID: #{userId}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <Dumbbell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-700">7-Day Completion Status</span>
          <span className="text-blue-600 font-mono">{completedCount}/7 Days</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 7-Day Checklist & Log */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Daily Workout Checklist & Journal:
        </h3>

        {days.map((day) => (
          <div
            key={day.dayNumber}
            className={`p-4 rounded-2xl border transition-all ${
              day.completed
                ? 'bg-blue-50/60 border-blue-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                onClick={() => toggleDay(day.dayNumber)}
                className="flex items-center space-x-3 cursor-pointer select-none"
              >
                {day.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-600 fill-blue-100" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900">{day.title}:</span>
                    <span className="text-sm font-semibold text-slate-700">{day.focus}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {day.completed ? "Completed ✔" : "Tap circle to mark complete"}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex-1 sm:max-w-md">
                <input
                  type="text"
                  value={day.notes}
                  onChange={(e) => updateNotes(day.dayNumber, e.target.value)}
                  placeholder="Add notes: weights used, reps achieved, or how it felt..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
