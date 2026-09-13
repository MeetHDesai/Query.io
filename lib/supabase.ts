import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Verify if Supabase credentials are provided
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and anon key must be provided in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DatabaseConnectionDB {
  id: string;
  userId: string;
  name: string;
  encryptedUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionDB {
  id: string;
  connection_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageDB {
  id: string;
  chat_id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  message_type?: string;
  results?: any;
}

// Functions to interact with Supabase
export const supabaseService = {
  // Database connection methods
  async getConnectionsByUserId(userId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
    
    return data as DatabaseConnectionDB[];
  },

  async getConnectionById(connectionId: string) {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .single();
    
    if (error) {
      console.error('Error fetching connection:', error);
      return null;
    }
    
    return data as DatabaseConnectionDB;
  },

  async createConnection(connection: Omit<DatabaseConnectionDB, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('connections')
      .insert([connection])
      .select();
    
    if (error) {
      console.error('Error creating connection:', error);
      console.log(error);
      throw error;
    }
    
    return data[0] as DatabaseConnectionDB;
  },

  // Chat session methods
  async getChatsByUserId(userId: string) {
    // First, get all connections for this user
    const { data: connections, error: connectionsError } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('chat_threads')
      .insert([chat])
      .select();
    
    if (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
    
    return data[0] as ChatSessionDB;
  },

  // Chat message methods
  async getMessagesByChatId(chatId: string) {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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