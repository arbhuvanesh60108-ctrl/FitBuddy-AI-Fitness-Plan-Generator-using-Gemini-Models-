import React, { useState } from 'react';
import { CODE_FILES, CodeFile } from '../data/codeFiles';
import { Copy, Check, Download, FileCode, Sparkles } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FileCode className="w-6 h-6 text-blue-600" />
            <span>Python Backend Codebase (Activity 2.2)</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Complete FastAPI routing, Pydantic schemas, Gemini AI services, SQLite operations, and Jinja2 templates.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : `Copy ${selectedFile.name}`}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {CODE_FILES.map((file) => {
          const isSelected = selectedFile.name === file.name;
          return (
            <button
              key={file.name}
              onClick={() => setSelectedFile(file)}
              className={`px-3.5 py-2 rounded-t-lg text-xs font-mono font-bold tracking-tight transition-all shrink-0 border-t border-x cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-blue-400 border-slate-800'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {file.name}
            </button>
          );
        })}
      </div>

      {/* File Description Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-center justify-between">
        <div>
          <span className="font-bold mr-2 font-mono">[{selectedFile.path}]:</span>
          <span>{selectedFile.description}</span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-200 text-blue-800 font-bold shrink-0 ml-3">
          {selectedFile.language}
        </span>
      </div>

      {/* Code Editor Container */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-300 font-semibold">{selectedFile.path}</span>
          </div>
          <span>{selectedFile.content.split('\n').length} lines</span>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto max-h-[650px] overflow-y-auto">
          <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre selection:bg-blue-600 selection:text-white">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
