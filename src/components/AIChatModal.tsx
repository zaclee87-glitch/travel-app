import React, { useState, useRef, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { CURRENCY_SYMBOLS } from '../services/mcpClient';
import { ProposedPlan } from '../types/travel';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  Hotel,
  Plane,
  DollarSign,
  Users,
  Compass,
  Loader2,
  Calendar,
} from 'lucide-react';

const QUICK_PROMPTS = [
  '🍣 4-day foodie & culture trip in Tokyo for 2 ($3,800 budget)',
  '🍷 Romantic Parisian art, wine & café escape ($4,200)',
  '🏛️ Ancient history, architecture & pasta crawl in Rome ($3,200)',
  '🌋 Nordic aurora & geothermal spa adventure in Iceland ($4,000)',
];

export const AIChatModal: React.FC = () => {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    isAIChatLoading,
    sendChatMessage,
    applyProposedPlan,
    isGeneratingItinerary,
  } = useTrip();

  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAIChatLoading, isChatOpen]);

  // Focus input on open
  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAIChatLoading) return;
    const query = inputQuery.trim();
    setInputQuery('');
    await sendChatMessage(query);
  };

  const handleApply = async (plan: ProposedPlan, navigateToTab: number = 3) => {
    await applyProposedPlan(plan, navigateToTab);
    setIsChatOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl h-[88vh] max-h-[800px] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Google AI Studio Holiday Planner
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Input your travel vision — AI Studio formulates selections and locks in your plan
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChatOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread Container (Localized vertical scroll) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs select-text">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-sky-950/80 border border-sky-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Proposed Plan Card Preview if present */}
                  {msg.proposedPlan && (
                    <div className="p-4 rounded-xl border border-sky-500/40 bg-slate-950/90 shadow-lg space-y-3">
                      {/* Destination & Theme Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="text-[11px] text-sky-400 font-mono flex items-center gap-1.5">
                            <Compass className="w-3 h-3" />
                            <span>{msg.proposedPlan.destinationCountry}</span>
                            <span>·</span>
                            <span>{msg.proposedPlan.destinationCode}</span>
                          </div>
                          <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                            {msg.proposedPlan.destinationCity} &mdash; {msg.proposedPlan.themeTitle}
                          </h4>
                        </div>

                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                          {CURRENCY_SYMBOLS[msg.proposedPlan.currency] || '$'}
                          {msg.proposedPlan.totalBudget.toLocaleString()}
                        </span>
                      </div>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded border border-slate-800/60">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{msg.proposedPlan.partySize} {msg.proposedPlan.partySize === 1 ? 'Solo Traveler' : 'Travelers'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded border border-slate-800/60">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>4 Days / 3 Nights</span>
                        </div>
                      </div>

                      {/* Flight & Hotel Picks */}
                      <div className="space-y-1.5 text-xs">
                        {msg.proposedPlan.flightSuggestion && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Plane className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>
                              Flight: <strong className="text-white">{msg.proposedPlan.flightSuggestion.airline}</strong> ({msg.proposedPlan.flightSuggestion.preference})
                            </span>
                          </div>
                        )}
                        {msg.proposedPlan.hotelSuggestion && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Hotel className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>
                              Hotel: <strong className="text-white">{msg.proposedPlan.hotelSuggestion.name}</strong> ({msg.proposedPlan.hotelSuggestion.neighborhood})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Vibe Tags */}
                      {msg.proposedPlan.vibeInterests && msg.proposedPlan.vibeInterests.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {msg.proposedPlan.vibeInterests.map((v) => (
                            <span
                              key={v}
                              className="text-[10px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Apply Plan Actions */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        {msg.isApplied ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Plan Active & Applied</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Ready to apply selections into workspace
                          </span>
                        )}

                        <button
                          onClick={() => handleApply(msg.proposedPlan!, 3)}
                          disabled={isGeneratingItinerary}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-950/60"
                        >
                          {isGeneratingItinerary ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Applying Plan...</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Plan & Open Itinerary</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 font-mono px-1">
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing / Inference Indicator */}
          {isAIChatLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-full bg-sky-950/80 border border-sky-800/60 flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl rounded-bl-none flex items-center gap-2 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span className="text-xs">Google AI Studio analyzing destination & formulating selections...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips (if thread has only 1 message) */}
        {chatMessages.length <= 1 && (
          <div className="px-5 py-2 border-t border-slate-800/60 bg-slate-950/40 shrink-0">
            <div className="text-[11px] text-slate-500 font-mono mb-1.5">
              Quick prompts to try:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setInputQuery(prompt);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white px-2.5 py-1 rounded-md border border-slate-800/80 transition-colors cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. 4-day romantic food & culture trip in Tokyo with $4,000 budget for 2..."
              disabled={isAIChatLoading}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isAIChatLoading}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-950/60 shrink-0"
            >
              {isAIChatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Consult AI</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
