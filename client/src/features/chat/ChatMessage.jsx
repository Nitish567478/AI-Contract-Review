import React from 'react';
import { Bot, User } from 'lucide-react';
import { CitationReference } from './CitationReference';

export function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-slate-900 text-white rounded-tr-none'
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-600 animate-pulse align-middle" />
          )}
        </div>

        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="space-y-2 pt-1 pl-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Grounded Supporting Evidence ({message.citations.length})
            </span>
            {message.citations.map((c, idx) => (
              <CitationReference key={idx} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
