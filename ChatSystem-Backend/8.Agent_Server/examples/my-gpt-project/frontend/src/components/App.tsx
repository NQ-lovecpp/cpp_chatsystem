'use client';

import type { AgentInputItem } from '@openai/agents';
import { History } from '@/components/History';
import { Button } from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AppProps = {
  title?: string;
  history?: AgentInputItem[];
  onSend: (message: string) => void;
  isStreaming?: boolean;
  currentReasoning?: string;
};

export function App({ title = 'Agent Demo', history, onSend, isStreaming = false, currentReasoning = '' }: AppProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 整体加载状态：正在发送或正在流式输出
  const isLoading = isSending || isStreaming;

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    const msg = message;
    setMessage('');
    try {
      await onSend(msg);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    await handleSend();
  };

  const hasHistory = history && history.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-zinc-50 to-white">
      {/* 头部 - 固定高度 */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-zinc-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </header>

      {/* 主内容区域 - 弹性填充剩余空间 */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto px-4 py-4 flex flex-col">
          {/* 聊天历史 - 可滚动区域 */}
          <div className="flex-1 min-h-0 rounded-2xl border border-zinc-100 shadow-sm bg-white overflow-hidden">
            {hasHistory ? (
              <History history={history} isLoading={isLoading} currentReasoning={currentReasoning} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 inline-block">
                    <Sparkles className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-800">
                    Hello! How can I help you today?
                  </h2>
                  <p className="text-zinc-500 max-w-md">
                    I can execute Python code, browse the web, and help you with various tasks.
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 底部输入区域 - 固定在底部 */}
      <footer className="flex-shrink-0 px-4 pb-4 pt-2 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-4xl mx-auto">
          <form
            className={cn(
              'flex items-center gap-3 w-full rounded-2xl p-2 transition-all duration-200',
              'border-2 bg-white shadow-lg',
              'focus-within:border-blue-400 focus-within:shadow-xl',
              isLoading ? 'border-zinc-200' : 'border-zinc-200'
            )}
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              className="flex-1 px-4 py-2.5 text-[15px] focus:outline-none bg-transparent placeholder:text-zinc-400"
              value={message}
              placeholder="Ask me anything..."
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              ref={inputRef}
            />

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="p-2"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    variant="primary"
                    size="icon"
                    type="submit"
                    disabled={!message.trim()}
                    className={cn(
                      'rounded-xl transition-all duration-200 h-10 w-10',
                      message.trim()
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-zinc-200 text-zinc-400'
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* 底部提示 */}
          <p className="text-center text-xs text-zinc-400 mt-3">
            Powered by OpenAI Agents SDK with MCP tools
          </p>
        </div>
      </footer>
    </div>
  );
}
