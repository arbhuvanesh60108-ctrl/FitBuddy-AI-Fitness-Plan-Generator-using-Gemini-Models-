import React, { useState } from 'react';
import {
  Sparkles,
  Dumbbell,
  ArrowLeft,
  Send,
  Loader2,
  Salad,
  MessageSquare,
  Flame,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Code
} from 'lucide-react';

interface FormData {
  username: string;
  user_id: string;
  age: string;
  weight: string;
  goal: string;
  intensity: string;
}

interface ResultData {
  username: string;
  user_id: number;
  age: number | string;
  weight: number | string;
  goal: string;
  intensity: string;
  workout_plan: string;
  nutrition_tip?: string;
  is_updated?: boolean;
}

const PRESETS: Array<{ label: string; data: FormData }> = [
  {
    label: "Alex Rivera (Muscle Building)",
    data: {
      username: "Alex Rivera",
      user_id: "101",
      age: "26",
      weight: "74.5",
      goal: "Muscle Building & Strength",
      intensity: "High",
    },
  },
  {
    label: "Elena Chen (Weight Loss & Tone)",
    data: {
      username: "Elena Chen",
      user_id: "204",
      age: "31",
      weight: "63.0",
      goal: "Weight Loss & Core Definition",
      intensity: "Moderate",
    },
  },
  {
    label: "Marcus Cole (Endurance & Cardio)",
    data: {
      username: "Marcus Cole",
      user_id: "305",
      age: "24",
      weight: "68.2",
      goal: "Half-Marathon Stamina & Agility",
      intensity: "Moderate",
    },
  },
];

export const LiveAppView: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(PRESETS[0].data);
  const [result, setResult] = useState<ResultData | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackUserId, setFeedbackUserId] = useState("101");

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [copiedTip, setCopiedTip] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'rendered' | 'jinja2-html'>('rendered');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormData(preset.data);
    setFeedbackUserId(preset.data.user_id);
    setErrorMsg(null);
  };

  // Submit to /generate-workout
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          user_id: Number(formData.user_id),
          age: Number(formData.age),
          weight: Number(formData.weight),
          goal: formData.goal,
          intensity: formData.intensity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate workout plan");
      }

      setResult({
        username: data.user.name,
        user_id: data.user.user_id,
        age: data.user.age,
        weight: data.user.weight,
        goal: data.user.goal,
        intensity: data.user.intensity,
        workout_plan: data.workout_plan,
        nutrition_tip: data.nutrition_tip,
        is_updated: false,
      });

      setFeedbackUserId(String(data.user.user_id));
      setFeedback("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while generating the plan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit to /submit-feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsUpdating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(feedbackUserId),
          feedback: feedback.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update workout plan");
      }

      setResult((prev) =>
        prev
          ? {
              ...prev,
              workout_plan: data.workout_plan,
              is_updated: true,
            }
          : null
      );
      setFeedback("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to update plan.");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'plan' | 'tip') => {
    navigator.clipboard.writeText(text);
    if (type === 'plan') {
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 2000);
    } else {
      setCopiedTip(true);
      setTimeout(() => setCopiedTip(false), 2000);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Route & Activity Header Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
            Current Route:
          </span>
          <code className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 text-blue-700 rounded border border-slate-200">
            {result ? "POST /generate-workout ➔ result.html" : "GET / ➔ index.html"}
          </code>
        </div>

        {result && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'rendered' ? 'jinja2-html' : 'rendered')}
              className="text-xs px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center space-x-1 border border-slate-300"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{viewMode === 'rendered' ? "Inspect Jinja2 Template" : "View Rendered Plan"}</span>
            </button>
            <button
              onClick={() => setResult(null)}
              className="text-xs px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium flex items-center space-x-1 border border-blue-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Form Input</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      {/* STATE 1: FORM INPUT (templates/index.html) */}
      {!result ? (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80')`,
            }}
          >
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 py-12 px-4 sm:px-8 max-w-xl mx-auto">
            {/* Quick Presets */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Quick Fill Demo Athletes:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1 text-xs rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Card (matching Activity 2.2 index.html) */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/50 text-slate-800">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-2 shadow-md shadow-blue-500/30">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  FitBuddy - AI Workout Generator
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Activity 2.2: FastAPI captures form inputs with <code className="text-blue-600 font-mono">Form(...)</code>
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* 1. Username */}
                <div>
                  <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter athlete name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Grid for User ID & Age */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="user_id" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      User ID:
                    </label>
                    <input
                      type="number"
                      id="user_id"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 101"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Age:
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 26"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <label htmlFor="weight" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Weight (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. 74.5"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Fitness Goal */}
                <div>
                  <label htmlFor="goal" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Fitness Goal:
                  </label>
                  <input
                    type="text"
                    id="goal"
                    name="goal"
                    value={formData.goal}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Muscle Building, Weight Loss, Flexibility"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Workout Intensity */}
                <div>
                  <label htmlFor="intensity" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Workout Intensity:
                  </label>
                  <select
                    id="intensity"
                    name="intensity"
                    value={formData.intensity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini Pro & Flash...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Plan</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: RESULT VIEW (templates/result.html) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <button
                  onClick={() => setResult(null)}
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold mb-3 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Return to Workout Generator (index.html)</span>
                </button>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>🏋️ Your Personalized Workout Plan</span>
                  {result.is_updated && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Updated via Feedback
                    </span>
                  )}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Rendered via FastAPI <code className="text-blue-400 font-mono">TemplateResponse("result.html")</code>
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(result.workout_plan, 'plan')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center space-x-1.5 border border-white/20 transition-all"
                >
                  {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPlan ? "Copied!" : "Copy Plan"}</span>
                </button>
              </div>
            </div>

            {/* User Information Grid (as in Activity 2.2 result.html) */}
            <div className="mt-6 pt-6 border-t border-slate-800/80">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                User Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Name</span>
                  <span className="text-sm font-bold text-white truncate block">{result.username}</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">User ID</span>
                  <span className="text-sm font-mono font-bold text-blue-400 block">{result.user_id}</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Age</span>
                  <span className="text-sm font-bold text-white block">{result.age}</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Weight</span>
                  <span className="text-sm font-bold text-white block">{result.weight} kg</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Goal</span>
                  <span className="text-sm font-bold text-emerald-400 truncate block">{result.goal}</span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-[11px] text-slate-400 block font-medium">Intensity</span>
                  <span className="text-sm font-bold text-amber-400 block">{result.intensity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* View Mode: Raw Jinja2 HTML Inspection */}
            {viewMode === 'jinja2-html' ? (
              <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-xs font-mono text-slate-300">
                <div className="text-amber-400 font-bold mb-2">templates/result.html snippet with populated Jinja2 context:</div>
                <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-slate-300">
{`<!-- Jinja2 Context Injected: username="${result.username}", user_id=${result.user_id}, goal="${result.goal}" -->
<div class="user-info">
    <div><strong>Name:</strong> ${result.username}</div>
    <div><strong>User ID:</strong> ${result.user_id}</div>
    <div><strong>Age:</strong> ${result.age}</div>
    <div><strong>Weight:</strong> ${result.weight} kg</div>
    <div><strong>Goal:</strong> ${result.goal}</div>
    <div><strong>Intensity:</strong> ${result.intensity}</div>
</div>

<div class="section-title">Workout Plan</div>
<pre>${result.workout_plan.slice(0, 200)}... (truncated)</pre>`}
                </pre>
              </div>
            ) : null}

            {/* Section 1: Workout Plan in <pre> block (as required by Milestone 3) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Workout Plan (Gemini Pro)
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Formatted in &lt;pre&gt; tag
                </span>
              </div>

              <div className="relative group">
                <pre className="w-full bg-slate-950 text-slate-100 p-5 sm:p-6 rounded-xl font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border border-slate-800 shadow-inner whitespace-pre-wrap selection:bg-blue-600 selection:text-white">
                  {result.workout_plan}
                </pre>
              </div>
            </div>

            {/* Section 2: Nutrition & Recovery Tip (Gemini Flash) in <pre> block */}
            {result.nutrition_tip && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Salad className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-extrabold text-slate-900">
                      🥗 Nutrition & Recovery Tip (Gemini Flash)
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(result.nutrition_tip!, 'tip')}
                    className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1"
                  >
                    {copiedTip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTip ? "Copied" : "Copy Tip"}</span>
                  </button>
                </div>

                <pre className="w-full bg-emerald-950/20 text-emerald-900 p-5 rounded-xl font-mono text-xs sm:text-sm leading-relaxed border border-emerald-200 whitespace-pre-wrap">
                  {result.nutrition_tip}
                </pre>
              </div>
            )}

            {/* Section 3: Share Your Feedback Form (POST /submit-feedback) */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  📝 Share Your Feedback
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                FastAPI route <code className="text-blue-600 font-mono">POST /submit-feedback</code> retrieves original plan, sends original + feedback to <code className="text-blue-600 font-mono">update_workout_plan()</code> with Gemini, and re-renders <code className="text-blue-600 font-mono">result.html</code>.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="feedback_user_id" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Unique User ID:
                  </label>
                  <input
                    type="number"
                    id="feedback_user_id"
                    value={feedbackUserId}
                    onChange={(e) => setFeedbackUserId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="feedback_text" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Feedback / Adjustments:
                  </label>
                  <textarea
                    id="feedback_text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    required
                    placeholder="e.g. Please swap barbell squats on Day 2 for dumbbell goblet squats due to lower back tightness, and add 5 mins core cooldown."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-white"
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-[11px] text-slate-500 font-medium">Quick suggestions:</span>
                  {[
                    "Limit workouts to 45 mins",
                    "Add knee-friendly alternatives",
                    "Focus more on upper chest & shoulders",
                    "Replace running with low-impact cycling"
                  ].map((sugg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFeedback(sugg)}
                      className="text-[11px] px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isUpdating || !feedback.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Workout Plan with Gemini Pro...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Feedback (POST /submit-feedback)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
