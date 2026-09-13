import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';
import { DatabaseConnectionDB, ChatSessionDB, ChatMessageDB } from './supabase';

// Create a Supabase client with admin privileges using the service role key
// This client should ONLY be used in server-side contexts (API routes, Server Components, etc.)
// NEVER expose this client to the client-side

if (typeof window !== 'undefined') {
  throw new Error('supabase-admin can only be used on the server-side');
}

export const supabaseAdmin = createClient(
  CONFIG.supabaseUrl,
  CONFIG.supabaseServiceKey
);

// Server-side Supabase service with admin privileges
export const supabaseAdminService = {
  // User management
  async getUserById(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  },

  // Database connection methods with admin access
  async getConnectionsByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('connections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
    
    // Map DB results to camelCase
    return (data || []).map((connection: any) => ({
      ...connection,
      encryptedUrl: connection.encrypted_url,
      userId: connection.user_id,
      createdAt: connection.created_at,
      updatedAt: connection.updated_at,
    }));
  },

  async getConnectionById(connectionId: string) {
    const { data, error } = await supabaseAdmin
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single();
    
    if (error) {
      console.error('Error fetching connection:', error);
      return null;
    }
    
    return { ...data, encryptedUrl: data.encrypted_url };
  },

  async createConnection(connection: Omit<DatabaseConnectionDB, 'id' | 'createdAt' | 'updatedAt'> | { user_id: string, name: string, encrypted_url: string }) {
    // Map camelCase or snake_case to DB snake_case
    const dbPayload = {
      user_id: (connection as any).user_id || (connection as any).userId,
      name: (connection as any).name,
      type: (connection as any).type,
      encrypted_url: (connection as any).encrypted_url || (connection as any).encryptedUrl,
      host: (connection as any).host,
      port: (connection as any).port,
      db_name: (connection as any).db_name || (connection as any).database,
    };
    const { data, error } = await supabaseAdmin
      .from('connections')
      .insert([dbPayload])
      .select()
      .single();
    if (error) {
      console.error('Error creating connection:', error);
      throw error;
    }
    // Map DB result to camelCase
    return {
      ...data,
      encryptedUrl: data.encrypted_url,
      userId: data.user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Chat session methods with admin access
  async getChatsByUserId(userId: string) {
    // First, get all connections for this user
    const { data: connections, error: connectionsError } = await supabaseAdmin
      .from('connections')
      .select('id')
      .eq('user_id', userId);
    
    if (connectionsError || !connections.length) {
      console.error('Error fetching connections:', connectionsError);
      return [];
    }
    
    // Get connection IDs 
    const connectionIds = connections.map(conn => conn.id);
    
    // Then get all chat threads for these connections
    const { data, error } = await supabaseAdmin
      .from('chat_threads')
      .select('*')
      .in('connection_id', connectionIds);
    
    if (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
    
    return data as ChatSessionDB[];
  },

  async createChat(chat: Omit<ChatSessionDB, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('chat_threads')
      .insert([chat])
      .select();
    
    if (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
    
    return data[0] as ChatSessionDB;
  },

  // Chat message methods with admin access
  async getMessagesByChatId(chatId: string) {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return data as ChatMessageDB[];
  },

  async addMessage(message: Omit<ChatMessageDB, 'id'>) {
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert([message])
      .select();
    
    if (error) {
      console.error('Error adding message:', error);
      throw error;
    }
    
    return data[0] as ChatMessageDB;
  }
}; 