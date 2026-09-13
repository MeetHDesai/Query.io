// This is a mock database service
// In a real application, you would use a real database and ORM like Prisma

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface DatabaseConnection {
  id: string;
  userId: string;
  name: string;
  type: "mysql" | "postgresql" | "mongodb" | "sqlite";
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  connectionString?: string;
  status: "connected" | "disconnected";
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  connectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  results?: QueryResult | null;
}

export interface QueryResult {
  type: "table" | "chart" | "both";
  chartType?: "line" | "bar";
  data: any[];
  columns: string[];
  sql: string;
  title?: string;
  description?: string;
}

// Mock data store
const users: Map<string, User> = new Map();
const connections: Map<string, DatabaseConnection> = new Map();
const chats: Map<string, ChatSession> = new Map();
const messages: Map<string, ChatMessage[]> = new Map();

// Initialize with some demo data
function initDemoData() {
  // Demo user
  const user: User = {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
  };
  users.set(user.id, user);

  // Demo connections
  const demoConnections: DatabaseConnection[] = [
    {
      id: "db-1",
      userId: user.id,
      name: "Product Database",
      type: "postgresql",
      host: "db.example.com",
      status: "connected",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "db-2",
      userId: user.id,
      name: "Customer Analytics",
      type: "mysql",
      host: "analytics.example.com",
      status: "connected",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  demoConnections.forEach(conn => connections.set(conn.id, conn));

  // Demo chats
  const demoChats: ChatSession[] = [
    {
      id: "chat-1",
      userId: user.id,
      title: "Product Queries",
      connectionId: "db-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "chat-2",
      userId: user.id,
      title: "Customer Analysis",
      connectionId: "db-2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  demoChats.forEach(chat => chats.set(chat.id, chat));

  // Demo messages
  messages.set("chat-1", [
    {
      id: "msg-1",
      chatId: "chat-1",
      content: "Hello! I'm your QueryIO assistant. What would you like to know about your database?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  
  messages.set("chat-2", [
    {
      id: "msg-1",
      chatId: "chat-2",
      content: "Hello! I'm your QueryIO assistant. What would you like to know about your database?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
}

// Initialize demo data
initDemoData();

// Database service functions
export const dbService = {
  // User methods
  getUserByEmail: (email: string) => {
    return Array.from(users.values()).find(user => user.email === email) || null;
  },
  
  getUserById: (id: string) => {
    return users.get(id) || null;
  },
  
  // Connection methods
  getConnectionsByUserId: (userId: string) => {
    return Array.from(connections.values()).filter(conn => conn.userId === userId);
  },
  
  getConnectionById: (id: string) => {
    return connections.get(id) || null;
  },
  
  createConnection: (data: Omit<DatabaseConnection, "id" | "createdAt" | "updatedAt">) => {
    const id = `db-${Date.now()}`;
    const newConnection: DatabaseConnection = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    connections.set(id, newConnection);
    return newConnection;
  },
  
  // Chat methods
  getChatsByUserId: (userId: string) => {
    return Array.from(chats.values()).filter(chat => chat.userId === userId);
  },
  
  getChatById: (id: string) => {
    return chats.get(id) || null;
  },
  
  createChat: (data: Omit<ChatSession, "id" | "createdAt" | "updatedAt">) => {
    const id = `chat-${Date.now()}`;
    const newChat: ChatSession = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    chats.set(id, newChat);
    messages.set(id, [
      {
        id: `msg-init-${Date.now()}`,
        chatId: id,
        content: "Hello! I'm your QueryIO assistant. What would you like to know about your database?",
        sender: "assistant",
        timestamp: new Date(),
      },
    ]);
    return newChat;
  },
  
  // Message methods
  getMessagesByChatId: (chatId: string) => {
    return messages.get(chatId) || [];
  },
  
  addMessage: (chatId: string, message: Omit<ChatMessage, "id" | "chatId">) => {
    const id = `msg-${Date.now()}`;
    const newMessage: ChatMessage = {
      ...message,
      id,
      chatId,
    };
    
    const chatMessages = messages.get(chatId) || [];
    chatMessages.push(newMessage);
    messages.set(chatId, chatMessages);
    
    return newMessage;
  },
}; 