import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Bot, User, AlertTriangle } from 'lucide-react';
import { QueryResult } from '../dashboard/components/QueryResult';
import { QueryResultViewer } from './QueryResultViewer';

// Define Message type
export type Message = {
  id: string;
  role: 'user' | 'ai';
  contentType: 'text' | 'query_result' | 'error';
  content: string | QueryResult;
  timestamp?: Date;
};

interface MessageBubbleProps {
  message: Message;
  debug?: boolean;
}

export function MessageBubble({ message, debug = false }: MessageBubbleProps) {
  return (
    <div
      className={`flex items-start space-x-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.role === 'ai' && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <Card className={`p-3 ${
        message.role === 'user'
          ? 'bg-primary text-primary-foreground max-w-[85%] md:max-w-[75%]'
          : 'bg-zinc-900 border-zinc-800 text-white w-full max-w-[90%] md:max-w-[80%] lg:max-w-[75%]'
        }`}>
        {/* Render TEXT messages */}
        {message.contentType === 'text' && (
          <p className="text-sm whitespace-pre-wrap">{message.content as string}</p>
        )}

        {/* Render ERROR messages */}
        {message.contentType === 'error' && (
          <p className="text-destructive flex items-center text-sm">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            {message.content as string}
          </p>
        )}

        {/* Render QUERY RESULT messages */}
        {message.contentType === 'query_result' && (
          <>
            {debug && (
              <div className="p-2 mb-2 border border-zinc-700 rounded bg-zinc-900">
                <p className="text-xs text-zinc-400 mb-1">Debug: QueryResult Format</p>
                <pre className="text-xs overflow-auto max-h-[100px] text-zinc-300">
                  {JSON.stringify(message.content, null, 2)}
                </pre>
              </div>
            )}
            
            <QueryResultViewer 
              sql={(message.content as QueryResult).sql}
              data={(message.content as QueryResult).data}
              columns={(message.content as QueryResult).columns}
              title={(message.content as QueryResult).title}
              summary={(message.content as QueryResult).description}
              chartMeta={{
                type: (message.content as QueryResult).chartType === 'bar' ? 'bar' : 'line',
                xKey: (message.content as QueryResult).columns[0],
                valueKey: (message.content as QueryResult).columns.length > 1 ? 
                  (message.content as QueryResult).columns[1] : undefined
              }}
            />
          </>
        )}
        
        {message.timestamp && (
          <p className="text-xs text-muted-foreground mt-3 text-right">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </Card>

      {message.role === 'user' && (
        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
          <AvatarFallback className="bg-primary/20">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
} 