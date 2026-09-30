import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, UserCheck, Dumbbell, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface StoredUser {
  user_id: number;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  updated_at: string;
}

interface StoredPlan {
  user_id: number;
  has_plan: boolean;
  plan_preview: string;
  has_nutrition: boolean;
  updated_at: string;
}

export const DatabaseInspector: React.FC = () => {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [plans, setPlans] = useState<StoredPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const fetchDatabaseState = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/database');
      const data = await res.json();
      setUsers(data.users || []);
      setPlans(data.plans || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseState();
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-blue-600" />
            <span>SQLite Database Inspector (fitbuddy.db)</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Persisting user profiles and workout plan histories across sessions via <code className="text-blue-600 font-mono">database.py</code>.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {lastRefreshed && (
            <span className="text-xs text-slate-400 font-mono">
              Last synced: {lastRefreshed}
            </span>
          )}
          <button
            onClick={fetchDatabaseState}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs flex items-center space-x-1.5 border border-blue-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Tables</span>
          </button>
        </div>
      </div>

      {/* Database Schema Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4" />
            <span>Table: users</span>
          </div>
          <code className="text-[11px] font-mono text-slate-300 block bg-slate-950 p-2.5 rounded border border-slate-800">
            CREATE TABLE users (user_id INTEGER PRIMARY KEY, name TEXT, age INTEGER, weight REAL, goal TEXT, intensity TEXT);
          </code>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Dumbbell className="w-4 h-4" />
            <span>Table: workout_plans</span>
          </div>
          <code className="text-[11px] font-mono text-slate-300 block bg-slate-950 p-2.5 rounded border border-slate-800">
            CREATE TABLE workout_plans (user_id INTEGER PRIMARY KEY, plan_text TEXT, updated_at TIMESTAMP, FOREIGN KEY...);
          </code>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Registered Athlete Profiles</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              {users.length} Records
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">sqlite3: save_user() & get_user()</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Age</th>
                <th className="px-6 py-3">Weight (kg)</th>
                <th className="px-6 py-3">Fitness Goal</th>
                <th className="px-6 py-3">Intensity</th>
                <th className="px-6 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400 italic">
                    No users stored yet. Submit the form on the Web App tab or invoke /api/generate-plan.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-600">#{u.user_id}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{u.name}</td>
                    <td className="px-6 py-3.5">{u.age} yrs</td>
                    <td className="px-6 py-3.5">{u.weight} kg</td>
                    <td className="px-6 py-3.5 text-emerald-700">{u.goal}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                        {u.intensity}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(u.updated_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <span>Persisted Workout Plans</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              {plans.length} Stored Plans
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">sqlite3: save_plan() & get_original_plan()</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Workout Plan Preview</th>
                <th className="px-6 py-3">Nutrition Tip</th>
                <th className="px-6 py-3">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                    No workout plans recorded in database yet.
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p.user_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-600">#{p.user_id}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-700 max-w-md truncate">
                      {p.plan_preview}
                    </td>
                    <td className="px-6 py-3.5">
                      {p.has_nutrition ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Generated</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(p.updated_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
