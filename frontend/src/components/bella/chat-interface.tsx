'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/types/bella';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only scroll when new messages are actually added
  useEffect(() => {
    if (messages.length > previousMessageCountRef.current) {
      scrollToBottom();
      previousMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Fetch active session on component mount
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        console.log('Fetching active session...');
        const response = await fetch('/api/bella/sessions');
        const data = await response.json();
        console.log('Session API response:', data);

        if (data.success && data.hasActiveSession) {
          console.log('Setting session:', data.session.sessionId);
          setSessionId(data.session.sessionId);
          const sessionMessages = data.session.messages || [];
          setMessages(sessionMessages);
          previousMessageCountRef.current = sessionMessages.length;
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Failed to fetch active session:', error);
      }
    };

    fetchActiveSession();
  }, []);

  // Poll for new messages when session is active
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bella/chat?sessionId=${sessionId}`);
        const data = await response.json();

        if (data.success && data.session.messages) {
          setMessages(data.session.messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return;

    setIsLoading(true);
    const messageText = input.trim();
    setInput('');

    try {
      const response = await fetch('/api/bella/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: messageText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Message will be updated via polling
    } catch (error) {
      console.error('Failed to send message:', error);
      // Re-add the message to input on error
      setInput(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!sessionId) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">
            Waiting for Bella to start the weekly planning session...
          </p>
          <p className="text-sm text-muted-foreground">
            The session starts every Sunday at 9 PM
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full max-h-[600px]", className)}>
      {/* Header */}
      <div className="border-b border-border bg-card p-4 rounded-t-lg">
        <h2 className="font-semibold text-lg">Weekly Planning with Bella</h2>
        <p className="text-sm text-muted-foreground">
          Plan your upcoming week through natural conversation
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Your conversation with Bella will appear here...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground ml-4"
                    : "bg-card text-card-foreground border border-border mr-4"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div
                  className={cn(
                    "text-xs mt-2 opacity-70",
                    message.role === 'user'
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-4 rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to Bella..."
            disabled={isLoading}
            className={cn(
              "flex-1 resize-none rounded-md border border-input bg-background px-3 py-2",
              "text-sm ring-offset-background placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "min-h-[40px] max-h-[120px]"
            )}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={cn(
              "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2",
              "text-sm font-medium text-primary-foreground ring-offset-background",
              "transition-colors hover:bg-primary/90 focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              "h-10 w-10"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}