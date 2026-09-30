import React, { useState } from 'react';
import { Salad, Sparkles, Flame, Apple, Coffee, Moon, Loader2, Copy, Check } from 'lucide-react';

export const DietPlannerView: React.FC = () => {
  const [goal, setGoal] = useState("Muscle Gain & Strength");
  const [dietType, setDietType] = useState("Balanced Omnivore");
  const [calories, setCalories] = useState(2300);
  const [mealPlan, setMealPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateDiet = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, dietType, calories }),
      });
      const data = await res.json();
      setMealPlan(data.meal_plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyMealPlan = () => {
    if (!mealPlan) return;
    navigator.clipboard.writeText(mealPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Salad className="w-6 h-6 text-emerald-600" />
          <span>FitBuddy Diet & Nutrition Suggestions</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Goal-based meal suggestions, macronutrient ratios, and recovery nourishment powered by Gemini.
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Goal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Fitness Goal:
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
            >
              <option value="Muscle Gain & Strength">Muscle Gain & Strength</option>
              <option value="Fat Loss & Lean Definition">Fat Loss & Lean Definition</option>
              <option value="Endurance & Cardiovascular Stamina">Endurance & Cardiovascular</option>
              <option value="General Wellness & Energy">General Wellness & Longevity</option>
            </select>
          </div>

          {/* Diet Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Dietary Preference:
            </label>
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-slate-50"
            >
              <option value="Balanced Omnivore">Balanced Omnivore</option>
              <option value="High-Protein Flexitarian">High-Protein Flexitarian</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan Plant-Based">Vegan Plant-Based</option>
              <option value="Low-Carb / Keto">Low-Carb / Keto</option>
              <option value="Mediterranean Diet">Mediterranean Diet</option>
            </select>
          </div>

          {/* Calorie Target */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Calories: <span className="text-emerald-600 font-mono">{calories} kcal</span>
            </label>
            <input
              type="range"
              min="1600"
              max="3500"
              step="50"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateDiet}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Macros & Generating Meal Suggestions with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Personalized Diet & Meal Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Meal Plan Output */}
      {mealPlan && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Apple className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-sm sm:text-base">
                Your Gemini-Generated Daily Meal Plan
              </h3>
            </div>
            <button
              onClick={copyMealPlan}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center space-x-1.5 border border-white/20"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Meal Plan'}</span>
            </button>
          </div>

          <div className="p-6">
            <pre className="bg-slate-950 text-slate-100 p-6 rounded-xl font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto border border-slate-800 whitespace-pre-wrap">
              {mealPlan}
            </pre>
          </div>
        </div>
      )}

      {/* Nutrition Guidelines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Coffee className="w-4 h-4" />
            <span>Pre-Workout Timing</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Fuel 60–90 Mins Prior</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Consume easily digestible complex carbs with low fat (e.g. banana, oatmeal, or toast with honey) to sustain circulating glycogen without digestive distress.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Post-Workout Window</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Protein + Rapid Glycogen</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Aim for 25–40g of complete protein (whey, Greek yogurt, or plant isolate) combined with 30–50g carbs within 45 minutes to kickstart muscle protein synthesis.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Moon className="w-4 h-4" />
            <span>Nighttime Recovery</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Slow-Digesting Casein</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cottage cheese or casein protein provides a steady release of amino acids overnight, reducing muscular breakdown during sleep.
          </p>
        </div>
      </div>
    </div>
  );
};
