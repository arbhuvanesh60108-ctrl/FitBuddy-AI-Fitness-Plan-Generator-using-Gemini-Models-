import React, { useState } from 'react';
import { Play, Copy, Check, Terminal, Clock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

interface EndpointConfig {
  id: string;
  title: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  pydanticSchema: string;
  defaultBody?: string;
  defaultParams?: Record<string, string>;
}

const ENDPOINTS: EndpointConfig[] = [
  {
    id: 'gemini-workout',
    title: '1. Generate Workout via Gemini Pro',
    method: 'POST',
    path: '/api/generate-workout/gemini',
    description: 'Direct REST endpoint invoking Gemini Pro with WorkoutRequest Pydantic model.',
    pydanticSchema: `class WorkoutRequest(BaseModel):
    goal: str
    intensity: str`,
    defaultBody: JSON.stringify(
      {
        goal: "Muscle Hypertrophy & Power",
        intensity: "High",
      },
      null,
      2
    ),
  },
  {
    id: 'flash-nutrition',
    title: '2. Generate Nutrition Tip via Gemini Flash',
    method: 'GET',
    path: '/api/nutrition-tip',
    description: 'Fast nutritional advice generation using Gemini Flash based on user goal.',
    pydanticSchema: `# Handled via Query Parameter:
@router.get("/nutrition-tip")
def get_flash_tip(goal: str):`,
    defaultParams: {
      goal: "Weight Loss & Lean Muscle",
    },
  },
  {
    id: 'generate-plan-db',
    title: '3. Save User Info & Generate Plan',
    method: 'POST',
    path: '/api/generate-plan',
    description: 'Persists user profile in SQLite and generates structured 7-day workout plan using UserInput model.',
    pydanticSchema: `class UserInput(BaseModel):
    user_id: int
    username: str
    age: int
    weight: float
    goal: str
    intensity: str`,
    defaultBody: JSON.stringify(
      {
        user_id: 101,
        username: "Alex Rivera",
        age: 26,
        weight: 74.5,
        goal: "Strength & Calisthenics",
        intensity: "Moderate",
      },
      null,
      2
    ),
  },
  {
    id: 'update-plan-feedback',
    title: '4. Update Workout Plan via Feedback',
    method: 'POST',
    path: '/api/update-plan/101',
    description: 'Retrieves original plan from SQLite, sends original + feedback to Gemini Pro, and updates the plan.',
    pydanticSchema: `class FeedbackRequest(BaseModel):
    feedback: str`,
    defaultBody: JSON.stringify(
      {
        feedback: "Make Day 3 focus on swimming rather than treadmill, and reduce leg volume on Day 5.",
      },
      null,
      2
    ),
  },
];

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointConfig>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(ENDPOINTS[0].defaultBody || '');
  const [queryParams, setQueryParams] = useState<Record<string, string>>(
    ENDPOINTS[0].defaultParams || {}
  );
  const [userIdPath, setUserIdPath] = useState('101');

  const [isLoading, setIsLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelect = (ep: EndpointConfig) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setQueryParams(ep.defaultParams || {});
    setResponseStatus(null);
    setResponseTime(null);
    setResponseData(null);
  };

  const executeRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseTime(null);
    setResponseData(null);

    const startTime = performance.now();

    try {
      let finalUrl = selectedEndpoint.path;

      if (selectedEndpoint.id === 'update-plan-feedback') {
        finalUrl = `/api/update-plan/${userIdPath}`;
      } else if (selectedEndpoint.method === 'GET' && queryParams.goal) {
        finalUrl = `${selectedEndpoint.path}?goal=${encodeURIComponent(queryParams.goal)}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(finalUrl, options);
      const elapsed = Math.round(performance.now() - startTime);

      setResponseStatus(res.status);
      setResponseTime(elapsed);

      const json = await res.json();
      setResponseData(json);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message || 'Request failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Intro Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Terminal className="w-6 h-6 text-blue-600" />
          <span>FastAPI REST Endpoints (Activity 2.2 / Milestone 3)</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Directly execute each route handler in <code className="font-mono text-blue-600">routes.py</code> to test Pydantic schema validation, Gemini API orchestration, and JSON responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoint List */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Available Endpoints:
          </span>
          {ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelect(ep)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      ep.method === 'POST'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 truncate">
                    {ep.path}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                  {ep.title}
                </h4>
              </button>
            );
          })}

          {/* Activity 2.2 Spec Card */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Milestone 3 Architecture</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every route in <code className="text-blue-300 font-mono">routes.py</code> links directly to functions from Activity 2.1:
            </p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li><code className="text-slate-200">generate_workout_gemini()</code></li>
              <li><code className="text-slate-200">generate_nutrition_tip_with_flash()</code></li>
              <li><code className="text-slate-200">update_workout_plan()</code></li>
            </ul>
          </div>
        </div>

        {/* Right Column: Request Builder & Response Inspector */}
        <div className="lg:col-span-8 space-y-6">
          {/* Endpoint Details Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                    selectedEndpoint.method === 'POST'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">
                  {selectedEndpoint.id === 'update-plan-feedback'
                    ? `/api/update-plan/${userIdPath}`
                    : selectedEndpoint.path}
                </span>
              </div>

              <button
                onClick={executeRequest}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3">
              {selectedEndpoint.description}
            </p>

            {/* Pydantic Schema reference */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Pydantic Validation Schema (schemas.py):
              </span>
              <pre className="bg-slate-50 text-slate-800 p-2.5 rounded-lg font-mono text-[11px] border border-slate-200 overflow-x-auto">
                {selectedEndpoint.pydanticSchema}
              </pre>
            </div>

            {/* Path param input if needed */}
            {selectedEndpoint.id === 'update-plan-feedback' && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Path Parameter: user_id
                </label>
                <input
                  type="number"
                  value={userIdPath}
                  onChange={(e) => setUserIdPath(e.target.value)}
                  className="w-full sm:w-48 px-3 py-1.5 text-xs rounded border border-slate-300 font-mono"
                />
              </div>
            )}

            {/* Query param input if GET */}
            {selectedEndpoint.method === 'GET' && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Query Parameter: goal
                </label>
                <input
                  type="text"
                  value={queryParams.goal || ''}
                  onChange={(e) => setQueryParams({ ...queryParams, goal: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 font-mono"
                  placeholder="e.g. Muscle Building, Fat Loss"
                />
              </div>
            )}

            {/* Request Body if POST */}
            {selectedEndpoint.method === 'POST' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Request Body (JSON Payload):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">application/json</span>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={selectedEndpoint.id === 'generate-plan-db' ? 9 : 5}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Response Output
                </span>
                {responseStatus !== null && (
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      responseStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    Status: {responseStatus} {responseStatus === 200 ? 'OK' : 'Error'}
                  </span>
                )}
                {responseTime !== null && (
                  <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{responseTime}ms</span>
                  </span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={copyResponse}
                  className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1 font-mono transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div className="mt-4">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="text-xs font-mono">Calling Gemini & FastAPI handler...</span>
                </div>
              ) : responseData ? (
                <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed border border-slate-800 max-h-96 whitespace-pre-wrap">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs font-mono">
                  Click <span className="text-blue-400 font-bold">"Send Request"</span> above to invoke this FastAPI route handler.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
