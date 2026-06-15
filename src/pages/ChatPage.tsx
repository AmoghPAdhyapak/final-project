import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bot, Send, Trash2, Loader2, AlertTriangle, Sparkles, User,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast }    from "sonner";
import { cn }       from "@/lib/utils";
import { ChatAPI }  from "@/services/api";
import type { ChatMessage } from "@/types";
import { useAuth }  from "@/contexts/AuthContext";

const SUGGESTED_PROMPTS = [
  "How can I improve my attendance?",
  "Which subject needs the most attention?",
  "Give me a study plan for this week.",
  "How many classes do I need to recover?",
  "What are my weakest subjects?",
  "How can I improve my internal marks?",
];

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border"
      )}>
        {isUser
          ? <User className="w-4 h-4" />
          : <Bot className="w-4 h-4 text-primary" />
        }
      </div>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isUser
          ? "bg-primary text-primary-foreground rounded-tr-sm"
          : "bg-card border border-border text-foreground rounded-tl-sm"
      )}>
        {msg.message.split("\n").map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
        {msg.timestamp && (
          <p className={cn(
            "text-[10px] mt-1.5",
            isUser ? "text-primary-foreground/60 text-right" : "text-muted-foreground"
          )}>
            {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { studentMeta }                 = useAuth();
  const [messages,  setMessages]        = useState<ChatMessage[]>([]);
  const [input,     setInput]           = useState("");
  const [sending,   setSending]         = useState(false);
  const [loading,   setLoading]         = useState(true);
  const [clearing,  setClearing]        = useState(false);
  const bottomRef                       = useRef<HTMLDivElement>(null);
  const textareaRef                     = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ChatAPI.getHistory()
      .then((d) => setMessages(d.history))
      .catch(() => toast.error("Could not load chat history."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;

    const userMsg: ChatMessage = {
      role: "user", message: msg, timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res    = await ChatAPI.send(msg);
      const botMsg: ChatMessage = {
        role: "model", message: res.reply, timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      toast.error("Failed to get a response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [input, sending]);

  const clearHistory = async () => {
    setClearing(true);
    try {
      await ChatAPI.clearHistory();
      setMessages([]);
      toast.success("Chat history cleared.");
    } catch {
      toast.error("Could not clear history.");
    } finally {
      setClearing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-h-[900px] animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap shrink-0">
        <div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold gold-text text-balance">
            AI Academic Mentor
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-pretty">
            Personalised academic guidance powered by Gemini — using your live academic data.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span className="text-foreground">Gemini 1.5 Flash</span>
          </div>
          <Badge className="text-xs bg-success/15 text-success border-success/30">
            <Sparkles className="w-3 h-3 mr-1" /> Academic only
          </Badge>
          {messages.length > 0 && (
            <Button
              variant="ghost" size="sm"
              onClick={clearHistory}
              disabled={clearing}
              className="border border-border text-muted-foreground hover:text-foreground h-8"
            >
              {clearing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Trash2 className="w-3.5 h-3.5" />
              }
              <span className="ml-1.5 text-xs">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Guardrail notice */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-xl border border-primary/20 bg-primary/5 mb-4 shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground text-pretty">
          This AI is scoped to academic topics only — attendance, marks, exams, study plans, and
          academic improvement. Off-topic questions will be redirected.
        </p>
      </div>

      {/* Chat card */}
      <Card className="palace-card flex-1 min-h-0 flex flex-col">
        <CardContent className="flex-1 min-h-0 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">

            {/* Loading skeleton */}
            {loading && (
              <div className="flex flex-col gap-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn("flex gap-3", i % 2 === 0 ? "flex-row-reverse" : "flex-row")}>
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className={cn("h-12 rounded-2xl bg-muted", i % 2 === 0 ? "w-48" : "w-64")} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 shadow-gold">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <p className="font-playfair text-lg font-semibold text-foreground mb-1">
                  Hello{studentMeta?.name ? `, ${studentMeta.name.split(" ")[0]}` : ""}!
                </p>
                <p className="text-muted-foreground text-sm text-pretty max-w-sm mb-6">
                  I'm your AI Academic Mentor. I have access to your attendance, marks, and
                  timetable. Ask me anything about your academics.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {SUGGESTED_PROMPTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      disabled={sending}
                      className="text-left px-3 py-2 rounded-xl border border-border bg-secondary/30 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 hover:border-primary/30 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!loading && messages.map((msg, i) => (
              <ChatBubble key={msg.id ?? i} msg={msg} />
            ))}

            {sending && <TypingIndicator />}
            <div ref={bottomRef} />
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                placeholder="Ask about your attendance, marks, study plan…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending || loading}
                rows={1}
                className="resize-none min-h-[40px] max-h-[120px] flex-1 text-sm px-3 py-2.5 rounded-xl border-border focus:border-primary/50"
                style={{ height: "auto" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || sending || loading}
                size="icon"
                className="w-10 h-10 shrink-0 rounded-xl"
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
