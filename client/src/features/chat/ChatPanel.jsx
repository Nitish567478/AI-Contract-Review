import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import { Send, Bot, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { api } from '../../api/client';

export function ChatPanel({ contractId }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingCitations, setStreamingCitations] = useState([]);
  const messagesEndRef = useRef(null);

  const sampleQuestions = [
    'What are the payment terms and invoice due dates?',
    'Under what conditions can either party terminate this agreement?',
    'Is there a limitation of liability or damages cap?',
    'Does this agreement renew automatically?',
  ];

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await api.getChatHistory(contractId, token);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contractId) {
      fetchHistory();
    }
  }, [contractId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || isStreaming) return;

    setInput('');
    const userMsg = { role: 'user', content: q, citations: [] };
    setMessages((prev) => [...prev, userMsg]);

    setIsStreaming(true);
    setStreamingContent('');
    setStreamingCitations([]);

    let accumulatedText = '';
    const accumulatedCitations = [];

    const token = await getToken();
    await api.streamChat(contractId, q, token, {
      onToken: (chunk) => {
        accumulatedText += chunk;
        setStreamingContent(accumulatedText);
      },
      onCitation: (citation) => {
        accumulatedCitations.push(citation);
        setStreamingCitations([...accumulatedCitations]);
      },
      onComplete: (data) => {
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.content || accumulatedText,
            citations: data.citations || accumulatedCitations,
          },
        ]);
        setStreamingContent('');
        setStreamingCitations([]);
      },
      onError: (err) => {
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${err.message || 'Failed to complete response.'}`,
            citations: [],
          },
        ]);
        setStreamingContent('');
      },
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[650px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Contract Q&A Chat</h4>
            <span className="text-[11px] text-slate-500">
              Grounded exclusively in this contract's clauses
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading conversation...
          </div>
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Bot className="w-8 h-8 text-slate-300 mb-2" />
            <h5 className="text-xs font-semibold text-slate-700 mb-1">
              Ask anything about this contract
            </h5>
            <p className="text-[11px] text-slate-500 max-w-xs mb-4">
              Answers are cited with exact verified quotations and page/section numbers.
            </p>

            <div className="w-full space-y-1.5 max-w-sm text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Suggested questions
              </span>
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sq)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 transition-colors"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, idx) => (
              <ChatMessage key={idx} message={m} />
            ))}

            {isStreaming && (
              <ChatMessage
                message={{
                  role: 'assistant',
                  content: streamingContent,
                  citations: streamingCitations,
                }}
                isStreaming={true}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this contract..."
            disabled={isStreaming}
            className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-sm"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
