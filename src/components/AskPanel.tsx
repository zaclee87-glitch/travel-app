import React, { useState } from 'react';
import {
  Send,
  Loader2,
  Wrench,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  CornerDownRight,
  Terminal,
} from 'lucide-react';

interface ToolCallItem {
  name: string;
  args: Record<string, any>;
  failed: boolean;
}

interface UnavailableServerItem {
  address: string;
  reason: string;
}

interface AskResponseData {
  answer: string;
  tool_calls: ToolCallItem[];
  unavailable: UnavailableServerItem[];
  model: string;
  answered_at: string;
}

const SAMPLE_QUESTIONS = [
  'What are current hotel rates and availability in Tokyo?',
  'What is the rain radar and forecast for Paris?',
  'What are the top cultural attractions in Rome?',
  'What flights are available to Reykjavik in October?',
];

export const AskPanel: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ status?: number; reason?: string } | null>(null);
  const [result, setResult] = useState<AskResponseData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || trimmed.length > 500 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Browser code calls only /api/ask
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          status: response.status,
          reason: data.reason || data.error || `HTTP ${response.status} Error`,
        });
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError({
        status: 500,
        reason: err?.message || 'Network request failed to /api/ask',
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full select-text">
      {/* Header */}
      <div className="mb-6 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Ask MCP Agent</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800 text-sky-300">
              POST /api/ask
            </span>
          </h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Ask any question about your trip. Gemini selects among tools published by the connected MCP servers,
          answering only from tool telemetry and detailing every function executed.
        </p>
      </div>

      {/* Main Input Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 mb-6 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="ask-question" className="font-medium text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Visitor Question</span>
            </label>
            <span
              className={`font-mono text-[11px] ${
                question.length > 500
                  ? 'text-rose-400 font-semibold'
                  : question.length > 450
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }`}
            >
              {question.length} / 500
            </span>
          </div>

          <div className="relative">
            <textarea
              id="ask-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the latest flight options and hotel rates in Tokyo with rain forecasts?"
              rows={3}
              maxLength={520}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Quick sample chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                <span>Suggestions:</span>
              </span>
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuestion(q)}
                  disabled={isLoading}
                  className="text-[11px] text-slate-400 hover:text-slate-200 bg-slate-950 hover:bg-slate-800 border border-slate-800/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left truncate max-w-[240px] sm:max-w-[280px]"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!question.trim() || question.length > 500 || isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-medium text-xs rounded-xl shadow-lg shadow-sky-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 self-end sm:self-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Consulting MCP Agent...</span>
                </>
              ) : (
                <>
                  <span>Submit Question</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 space-y-1 mb-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-semibold text-xs text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Agent Error {error.status ? `(Status ${error.status})` : ''}</span>
          </div>
          <p className="text-xs text-rose-300/90 font-mono whitespace-pre-wrap pl-6">
            {error.reason}
          </p>
        </div>
      )}

      {/* Answer & Sequential Tools Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Answer Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <h2 className="text-sm font-semibold text-white tracking-tight">Agent Answer</h2>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400">
                  {result.model}
                </span>
                {result.answered_at && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(result.answered_at).toLocaleTimeString()}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-950/60 rounded-xl p-4 border border-slate-800/60">
              {result.answer || <span className="italic text-slate-500">No text response returned.</span>}
            </div>
          </div>

          {/* Underneath: Every Tool Called in Sequential Order with its Arguments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Sequential Tools Called ({result.tool_calls.length})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Execution sequence from automaticFunctionCallingHistory
              </span>
            </div>

            {result.tool_calls.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-500 italic flex items-center gap-2">
                <CornerDownRight className="w-3.5 h-3.5 text-slate-600" />
                <span>No tools were called by the agent for this query.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {result.tool_calls.map((tool, idx) => (
                  <div
                    key={`${tool.name}-${idx}`}
                    className={`rounded-xl border p-4 transition-all ${
                      tool.failed
                        ? 'bg-rose-950/20 border-rose-800/50'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300 flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-semibold text-sky-300">
                          {tool.name}
                        </span>
                      </div>

                      {tool.failed ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Executed</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Arguments:
                      </div>
                      <pre className="text-xs font-mono text-slate-300 bg-slate-900/90 rounded-lg p-3 border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(tool.args, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Followed by Unavailable Servers Rendered in Grey Text */}
          {result.unavailable && result.unavailable.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-slate-400 border-b border-slate-800/60 pb-2">
                <Server className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-semibold tracking-wide uppercase">
                  Unavailable MCP Servers ({result.unavailable.length})
                </h4>
              </div>

              <div className="space-y-2">
                {result.unavailable.map((unav, idx) => (
                  <div
                    key={`${unav.address}-${idx}`}
                    className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 text-slate-500 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span className="text-slate-400 select-all font-medium">
                        {unav.address}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 pl-3.5 leading-relaxed">
                      Reason: {unav.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
