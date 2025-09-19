'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/bella/chat-interface';
import { WeeklyPlanView } from '@/components/bella/weekly-plan-view';
import { MessageCircle, Calendar, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'chat' | 'plan';

export default function BellaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bella</h1>
                <p className="text-sm text-muted-foreground">
                  Your AI Weekly Planning Assistant
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === 'chat'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === 'plan'
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>Weekly Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Weekly Planning Session</h2>
              <p className="text-muted-foreground">
                Every Sunday at 9 PM, Bella starts a conversation to help you plan your upcoming week.
                Share your goals, deadlines, and commitments, and she&apos;ll create a personalized schedule.
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              <ChatInterface />
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Your Weekly Schedule</h2>
              <p className="text-muted-foreground">
                View your personalized weekly plan created through your conversation with Bella.
                The plan includes your targets, daily tasks, and optimized schedule.
              </p>
            </div>
            <WeeklyPlanView />
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Bella is online</span>
              </div>
              <span>Next session: Sundays at 9:00 PM</span>
            </div>
            <div>
              <span>Powered by Groq AI & Trigger.dev</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}