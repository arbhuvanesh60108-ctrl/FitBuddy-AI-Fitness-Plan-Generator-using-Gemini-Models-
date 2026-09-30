import React from 'react';
import { Layers, ArrowRight, Database, Sparkles, CheckCircle2, ShieldAlert, Cpu, FileText } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Layers className="w-6 h-6 text-blue-600" />
          <span>Activity 2.2 Architecture & Data Flow</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Detailed technical walkthrough of Milestone 3: FastAPI Routing, User Input Processing, and Gemini Integration for FitBuddy.
        </p>
      </div>

      {/* Visual Flow Diagram */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-2">
          <Cpu className="w-4 h-4" />
          <span>End-to-End Execution Flow</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Step 1: Input Collection
            </span>
            <h4 className="text-sm font-bold text-white">index.html (HTML Form)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              User enters: <code className="text-slate-200">username</code>, <code className="text-slate-200">user_id</code>, <code className="text-slate-200">age</code>, <code className="text-slate-200">weight</code>, <code className="text-slate-200">goal</code>, <code className="text-slate-200">intensity</code>.
            </p>
            <div className="text-[11px] font-mono text-emerald-400 bg-slate-900 p-2 rounded">
              POST /generate-workout
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Step 2: FastAPI & AI Layer
            </span>
            <h4 className="text-sm font-bold text-white">routes.py & ai_services.py</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI parses inputs via <code className="text-slate-200">Form(...)</code>, saves user in SQLite, invokes <code className="text-slate-200">generate_workout_gemini()</code> and <code className="text-slate-200">generate_nutrition_tip_with_flash()</code>.
            </p>
            <div className="text-[11px] font-mono text-amber-400 bg-slate-900 p-2 rounded">
              Gemini Pro + Flash Orchestration
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Step 3: Dynamic Rendering
            </span>
            <h4 className="text-sm font-bold text-white">result.html (Jinja2)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI returns <code className="text-slate-200">TemplateResponse("result.html")</code> displaying user details, workout plan inside <code className="text-slate-200">&lt;pre&gt;</code>, and the feedback form.
            </p>
            <div className="text-[11px] font-mono text-blue-400 bg-slate-900 p-2 rounded">
              Feedback Loop: POST /submit-feedback
            </div>
          </div>
        </div>
      </div>

      {/* Key Requirements Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Activity 2.2 Core Implementations</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Jinja2 Template Integration:</strong> Configured via <code className="text-blue-600 font-mono">Jinja2Templates(directory=TEMPLATE_DIR)</code> and rendered using <code className="text-blue-600 font-mono">templates.TemplateResponse</code>.
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">User Input Processing:</strong> Dual handling with FastAPI <code className="text-blue-600 font-mono">Form(...)</code> dependencies for the web form and Pydantic models (<code className="text-blue-600 font-mono">UserInput</code>, <code className="text-blue-600 font-mono">WorkoutRequest</code>) for REST API calls.
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Gemini Pro Integration:</strong> Generates 7-day structured fitness plans via <code className="text-blue-600 font-mono">generate_workout_gemini()</code> and adjusts plans via <code className="text-blue-600 font-mono">update_workout_plan()</code>.
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Gemini Flash Integration:</strong> Produces rapid, actionable nutrition and recovery guidance via <code className="text-blue-600 font-mono">generate_nutrition_tip_with_flash()</code>.
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
              <div>
                <strong className="text-slate-900">Formatting Discipline:</strong> Workout plans and nutrition tips are strictly enclosed inside <code className="text-blue-600 font-mono">&lt;pre&gt;</code> blocks in <code className="text-blue-600 font-mono">result.html</code> to preserve layout fidelity.
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Milestone 3: Route Map</span>
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700">GET /</span>
              <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
                Renders <code className="font-mono">index.html</code> (user form).
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700">POST /generate-workout</span>
              <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
                Captures Form data, saves user, calls Gemini Pro & Flash, renders <code className="font-mono">result.html</code>.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700">POST /submit-feedback</span>
              <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
                Reads user_id + feedback, retrieves original plan, revises with Gemini Pro, re-renders <code className="font-mono">result.html</code>.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700">POST /generate-workout/gemini</span>
              <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
                API endpoint using <code className="font-mono">WorkoutRequest</code>.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-blue-700">POST /update-plan/&#123;user_id&#125;</span>
              <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
                API endpoint using <code className="font-mono">FeedbackRequest</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
