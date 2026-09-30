import React, { useState } from 'react';
import { Header, TabType } from './components/Header';
import { LiveAppView } from './components/LiveAppView';
import { DietPlannerView } from './components/DietPlannerView';
import { ProgressTrackerView } from './components/ProgressTrackerView';
import { AiChatView } from './components/AiChatView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { ApiExplorer } from './components/ApiExplorer';
import { DatabaseInspector } from './components/DatabaseInspector';
import { CodeViewer } from './components/CodeViewer';
import { ArchitectureView } from './components/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('live-app');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendReady={true}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'live-app' && <LiveAppView />}
        {activeTab === 'diet-planner' && <DietPlannerView />}
        {activeTab === 'progress' && <ProgressTrackerView />}
        {activeTab === 'chat' && <AiChatView />}
        {activeTab === 'exercise-lib' && <ExerciseLibraryView />}
        {activeTab === 'api-explorer' && <ApiExplorer />}
        {activeTab === 'database' && <DatabaseInspector />}
        {activeTab === 'code-viewer' && <CodeViewer />}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">FitBuddy</span> — AI Fitness Plan Generator & FastAPI Backend using Google Gemini
          </div>
          <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-400">
            <span>FastAPI 0.115</span>
            <span>•</span>
            <span>Gemini Pro & Flash</span>
            <span>•</span>
            <span>SQLite3</span>
            <span>•</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

