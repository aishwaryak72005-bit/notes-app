import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import Loader from '../../components/common/Loader';
import CodeBlock from '../../components/notes/CodeBlock';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  BookOpen,
  MessageSquare,
  Bot,
  User,
  Lightbulb,
  HelpCircle,
  Code,
  Flame,
  ArrowRight,
} from 'lucide-react';

const AITutorPage = () => {
  const [searchParams] = useSearchParams();
  const conceptIdParam = searchParams.get('concept');
  const conceptTitleParam = searchParams.get('title');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const list = await aiService.getConversations();
      setConversations(list);

      // If user navigated with a specific concept
      if (conceptIdParam) {
        const existing = list.find((c) => String(c.concept_id) === String(conceptIdParam));
        if (existing) {
          selectConversation(existing.id);
        } else {
          // Create new session for this concept
          const newSession = await aiService.createConversation(conceptIdParam, 'beginner');
          await loadConversations();
          selectConversation(newSession.id);
        }
      } else if (list.length > 0) {
        selectConversation(list[0].id);
      } else {
        // Create initial session
        const initSession = await aiService.createConversation(null, 'beginner');
        await loadConversations();
        selectConversation(initSession.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [conceptIdParam]);

  const selectConversation = async (id) => {
    try {
      const details = await aiService.getConversation(id);
      setActiveConv(details);
      setMessages(details.messages || []);
      setCurrentLevel(details.explanation_level || 'beginner');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await aiService.createConversation(null, currentLevel);
      const list = await aiService.getConversations();
      setConversations(list);
      selectConversation(newSession.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this AI tutoring session?')) return;
    try {
      await aiService.deleteConversation(id);
      const list = await aiService.getConversations();
      setConversations(list);
      if (activeConv?.id === id) {
        if (list.length > 0) {
          selectConversation(list[0].id);
        } else {
          setActiveConv(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLevelChange = async (level) => {
    setCurrentLevel(level);
    if (activeConv) {
      try {
        await aiService.updateLevel(activeConv.id, level);
        setActiveConv((prev) => ({ ...prev, explanation_level: level }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = async (messageToSend = null) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || !activeConv || isSending) return;

    setInputMessage('');
    setIsSending(true);

    // Optimistically show user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: text,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await aiService.sendMessage(activeConv.id, text, currentLevel);
      // Replace with actual messages from backend
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.user_message,
        res.ai_message,
      ]);
    } catch (err) {
      console.error('Error sending message to AI Tutor:', err);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    { label: "💡 I don't understand this concept", text: "I don't understand this concept. Can you explain it with a simpler, different everyday analogy?" },
    { label: "🔍 Explain code line-by-line", text: "Can you explain the code snippet for this concept line by line?" },
    { label: "🎯 Give a practical real-world analogy", text: "Give me an intuitive real-world analogy to remember this concept forever." },
    { label: "📝 Generate a practice question", text: "Please generate a practice challenge question for this topic with a hint." },
  ];

  if (loading) {
    return <Loader message="Connecting to TechNotes Personalized AI Tutor..." />;
  }

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row gap-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Left Column: Conversations Sidebar */}
      <div className="w-full md:w-80 bg-white rounded-3xl p-5 shadow-card border border-sage/40 flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-sage/30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-forest text-ivory flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 text-sage" />
              </div>
              <span className="text-sm font-bold text-charcoal">AI Tutoring Sessions</span>
            </div>
            <button
              onClick={handleNewSession}
              title="Start New Session"
              className="p-1.5 rounded-xl bg-ivory border border-sage/60 hover:bg-forest hover:text-ivory text-forest transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Conversations History List */}
          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
            {conversations.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`p-3 rounded-2xl cursor-pointer text-xs transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-sage/60 text-forest-dark font-bold border border-sage shadow-xs'
                      : 'hover:bg-ivory text-charcoal border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <MessageSquare className="w-4 h-4 text-forest flex-shrink-0" />
                    <div className="truncate">
                      <div className="truncate font-semibold">{c.title}</div>
                      <div className="text-[10px] text-muted capitalize">
                        Level: {c.explanation_level} • {c.updated_at}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSession(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Adaptive Level Guidance Card */}
        <div className="pt-4 border-t border-sage/30">
          <div className="p-3 bg-ivory/80 rounded-2xl border border-sage/40 text-[11px] text-muted space-y-1">
            <span className="font-bold text-forest block">Adaptive Learning Enabled:</span>
            <span>Tell the tutor whenever you struggle — it will automatically simplify and switch analogies!</span>
          </div>
        </div>
      </div>

      {/* Right Column: Active Chat Feed & Input */}
      <div className="flex-1 bg-white rounded-3xl shadow-card border border-sage/40 flex flex-col justify-between overflow-hidden">
        {/* Chat Header: Concept Context & Adaptive Level Pills */}
        <div className="p-4 sm:px-6 py-3.5 border-b border-sage/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ivory/40">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-charcoal">{activeConv?.title || 'Interactive AI Tutor'}</h2>
            </div>
            {activeConv?.concept_title && (
              <span className="text-[11px] text-muted block mt-0.5">
                Target Concept: <strong className="text-forest">{activeConv.concept_title}</strong>
              </span>
            )}
          </div>

          {/* 3-Tier Adaptive Level Selector */}
          <div className="flex items-center space-x-1.5 p-1 bg-white rounded-2xl border border-sage/60 self-start sm:self-auto">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider pl-2 pr-1">Level:</span>
            {[
              { id: 'beginner', label: 'Beginner' },
              { id: 'intermediate', label: 'Intermediate' },
              { id: 'advanced', label: 'Advanced' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleLevelChange(lvl.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  currentLevel === lvl.id
                    ? 'bg-forest text-ivory shadow-xs'
                    : 'text-muted hover:text-charcoal hover:bg-ivory'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id || index}
                className={`flex items-start space-x-3 ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                    isAI ? 'bg-forest text-ivory' : 'bg-sage text-forest-dark'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4 text-sage" /> : <User className="w-4 h-4 text-forest" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                    isAI
                      ? 'bg-ivory/60 text-charcoal border border-sage/50 shadow-xs'
                      : 'bg-forest text-ivory font-medium shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">{msg.content}</div>
                  <div
                    className={`text-[10px] mt-2 ${
                      isAI ? 'text-muted text-right' : 'text-sage-light text-left'
                    }`}
                  >
                    {msg.created_at}
                  </div>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-forest text-ivory flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 text-sage" />
              </div>
              <div className="bg-ivory/80 rounded-2xl px-4 py-3 text-xs text-muted border border-sage/50 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-forest animate-spin" />
                <span>AI Tutor is crafting an adaptive explanation for you...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Prompt Pills */}
        <div className="px-4 sm:px-6 pt-2 pb-1 border-t border-sage/20 bg-ivory/20 flex items-center space-x-2 overflow-x-auto">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isSending}
              onClick={() => handleSend(qp.text)}
              className="px-3 py-1.5 rounded-full bg-white border border-sage/60 hover:border-forest text-forest hover:bg-sage/20 text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-6 bg-white border-t border-sage/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputMessage}
              disabled={isSending}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question, request code clarification, or say 'I don't understand'..."
              className="flex-1 px-4 py-3 bg-lightgrey/50 border border-sage/60 rounded-2xl text-xs sm:text-sm text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white shadow-xs transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="p-3 bg-forest hover:bg-forest-dark text-ivory rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
              title="Send to Tutor"
            >
              <Send className="w-4 h-4 text-sage" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;
