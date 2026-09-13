import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { MessageBubble, Message } from './MessageBubble';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bot } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingHistory: boolean;
  debug?: boolean;
}

export function MessageList({ messages, isLoading, isLoadingHistory, debug = false }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {messages.length === 0 && !isLoadingHistory && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2 max-w-md p-8">
              <h3 className="text-lg font-medium">Welcome to QueryIO</h3>
              <p className="text-sm text-muted-foreground">
                Ask any question about your data and get answers in text, tables, or visualizations.
              </p>
            </div>
          </div>
        )}

        {isLoadingHistory && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading conversation history...</p>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} debug={debug} />
        ))}

        {isLoading && (
          <div className="flex justify-start items-start space-x-2">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="p-3 bg-muted">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">QueryIO is thinking...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ScrollArea>
  );
} 