"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"; 
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import { parseCookies } from "nookies"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Database,
  MessageSquare,
  Send,
  Settings,
  LogOut,
  ChevronDown,
  BarChart2,
  TableIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Bot,
  Code,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
} from "recharts"
import { toast } from "sonner"; // Import toast from sonner
import ReactMarkdown from 'react-markdown'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend
} from "@/components/ui/chart"
import { QueryChart } from "@/app/dashboard/components/QueryChart"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QueryResultComponent } from "@/app/dashboard/components/QueryResult"

// Import Supabase service
import { supabaseService, DatabaseConnectionDB, ChatSessionDB, ChatMessageDB } from "@/lib/supabase"

// Types
interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  message_type?: string
  results?: QueryResult | null
}

interface QueryResult {
  type: "table" | "chart" | "both" | "text";
  chartType?: "line" | "bar" | "pie" | "area" | "scatter" | "column";
  data: any[];
  columns: string[];
  sql: string;
  title?: string;
  description?: string;
  vizType?: string;
  chartData?: any[];
  chartConfig?: Record<string, { label: string; color: string }>;
}

interface DatabaseConnection {
  id: string
  name: string
  type: "mysql" | "postgresql" | "mongodb" | "sqlite"
  host?: string
  status: "connected" | "disconnected"
}

interface ChatSession {
  id: string
  title: string
  connectionId: string
  messages: Message[]
  createdAt: Date
}

interface QueryResponseJson {
  sql?: string;
  outputType?: "table" | "chart" | "text";
  chartSpec?: {
    type: "line" | "bar" | "pie" | "area" | "scatter" | "column";
    title?: string;
    xAxis?: string;
    yAxis?: string | string[];
    colors?: string[];
    legendPosition?: "top" | "right" | "bottom" | "left";
    stacked?: boolean;
    gridLines?: boolean;
    dataLabels?: boolean;
    tooltips?: boolean;
    dateFormat?: string;
    numberFormat?: string;
    areaFill?: boolean;
    tension?: number;
    barThickness?: number;
  };
  data?: {
    columns: string[];
    rows: any[][];
  };
  chartData?: any[];
  chartConfig?: Record<string, { label: string; color: string }>;
  answer?: string;
  explanation?: string;
}

// Thinking indicator component
const ThinkingIndicator = () => (
  <div className="flex items-center space-x-2 p-2 rounded bg-[var(--bg-code)]">
    <Loader2 className="h-4 w-4 animate-spin text-[var(--text-secondary)]" />
    <span className="text-sm text-[var(--text-secondary)]">QueryIO is thinking...</span>
  </div>
);

export default function Dashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  
  // Move ALL state declarations up here before any conditional returns
  const [activeTab, setActiveTab] = useState<string>("")
  const [inputValue, setInputValue] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNewConnectionDialog, setShowNewConnectionDialog] = useState(false)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [activeResultView, setActiveResultView] = useState<"table" | "chart">("chart")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [databases, setDatabases] = useState<DatabaseConnection[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState("");
  const [openQuery, setOpenQuery] = useState(false);
  const [sqlQuery, setSqlQuery] = useState("");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [charts, setCharts] = useState<{ id: string; title: string; data: any[] }[]>([]);
  const [databaseSaved, setDatabaseSaved] = useState(false);
  const [messageResultViews, setMessageResultViews] = useState<Record<string, "table" | "chart">>({});
  const [messageViewPreferences, setMessageViewPreferences] = useState<Record<string, "table" | "chart">>({});
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])
  
  // Fetch user data from API endpoints
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true); // Show loading state while fetching
        try {
          // Get the Firebase token from cookie
          const cookies = parseCookies();
          const firebaseToken = cookies.clientToken;
          
          if (!firebaseToken) {
            console.error("No Firebase token found in cookies");
            toast.error("Authentication error. Please log in again.");
            router.push("/login");
            return;
          }
          
          const authHeaders = {
            'Authorization': `Bearer ${firebaseToken}`,
            'Content-Type': 'application/json'
          };
          
          console.log("Fetching user data with Firebase token");
          
          // Fetch database connections from API
          const connectionsResponse = await fetch('/api/user/connections', {
            headers: authHeaders
          });
          
          if (!connectionsResponse.ok) {
            throw new Error(`Failed to fetch connections: ${connectionsResponse.statusText}`);
          }
          const dbConnections = await connectionsResponse.json();
          
          console.log('Fetched connections:', dbConnections); // Debug log
          
          // Convert data format to app format
          const formattedConnections: DatabaseConnection[] = dbConnections.map((conn: any) => ({
            id: conn.id,
            name: conn.name,
            type: conn.type || 'postgresql', // Default type if missing
            host: conn.host,
            status: 'connected', // Default status
          }));
          
          setDatabases(formattedConnections);
          
          // Fetch chat sessions from API
          const chatsResponse = await fetch('/api/user/chats', {
            headers: authHeaders
          });
          
          if (!chatsResponse.ok) {
            throw new Error(`Failed to fetch chats: ${chatsResponse.statusText}`);
          }
          const chatsData = await chatsResponse.json();
          
          console.log('Fetched chats:', chatsData); // Debug log
          
          // Format chats and messages for the app with proper parsing
          const chatsWithMessages: ChatSession[] = chatsData.map((chat: any) => {
            // Ensure messages is an array
            const messagesArray = Array.isArray(chat.messages) ? chat.messages : [];
            
            const formattedMessages: Message[] = messagesArray.map((msg: any) => {
  let parsedResults = null;
  let messageContent = msg.content || "";
  let messageType = msg.message_type || "text";

  // For query_result messages, always use the results field if present
  if (messageType === 'query_result') {
    if (msg.results) {
      if (typeof msg.results === 'string') {
        try {
          parsedResults = JSON.parse(msg.results);
        } catch (e) {
          console.error("Failed to parse query_result results field:", e);
        }
      } else {
        parsedResults = msg.results;
      }
    } else if (typeof messageContent === 'string') {
      // Fallback: try to parse content as JSON if results is missing
      try {
        parsedResults = JSON.parse(messageContent);
        console.log("Parsed query_result from content as fallback");
      } catch (e) {
        console.error("Failed to parse query_result content as fallback:", e);
      }
    }
  } else if (msg.results) {
    // For non-query_result messages, parse results if present
    if (typeof msg.results === 'string') {
      try {
        parsedResults = JSON.parse(msg.results);
      } catch (e) {
        console.error("Failed to parse message results:", e);
      }
    } else {
      parsedResults = msg.results;
    }
  }

  // For query_result messages, set content to a placeholder or summary
  if (messageType === 'query_result') {
    messageContent = parsedResults && parsedResults.description
      ? parsedResults.description
      : '[Query Result]';
  }

  // Properly determine sender type
  let sender = "assistant";
  if (msg.sender === "user" || (msg.role && msg.role === "user")) {
    sender = "user";
  } else if (msg.sender === "assistant" || (msg.role && msg.role === "assistant")) {
    sender = "assistant";
  } else if (messageContent && typeof messageContent === 'string' && 
            (messageContent.startsWith("how") || 
             messageContent.startsWith("How") || 
             messageContent.startsWith("Tell") || 
             messageContent.startsWith("What") ||
             messageContent.startsWith("Show"))) {
    sender = "user";
  }

  console.log("Processing message:", { 
    id: msg.id, 
    content: typeof messageContent === 'string' ? (messageContent.substring(0, 20) + "...") : "[QueryResult Object]", 
    messageType: messageType,
    originalSender: msg.sender || msg.role, 
    determinedSender: sender 
  });

  return {
    id: msg.id || `generated-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content: messageContent,
    sender: sender,
    timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
    results: parsedResults,
  };
});
            
            return {
              id: chat.id,
              title: chat.name || `Chat ${chat.id.substring(0, 8)}`, // Fallback title if name is missing
              connectionId: chat.connection_id || chat.connectionId,
              messages: formattedMessages,
              createdAt: new Date(chat.created_at || chat.createdAt || Date.now()),
            };
          });
          
          setChatSessions(chatsWithMessages);
console.log('State after setChatSessions:', chatsWithMessages);
          
          // Set active tab to first chat if available
          if (chatsWithMessages.length > 0 && !activeTab) {
            setActiveTab(chatsWithMessages[0].id);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load your data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    // Clean up function
    return () => {
      // Any cleanup code here
    };
  }, [user, router, activeTab]); // Dependencies
  
  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  // Get active chat
  const activeChat = chatSessions.find((chat) => chat.id === activeTab)

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeChat) return;
    
    setIsLoading(true);
    setIsStreaming(true);

    // Add user message to UI
    const userMessage: Message = {
      id: `msg-${Date.now()}-1`,
      content: inputValue,
      sender: "user" as const,
      timestamp: new Date(),
    };

    const updatedSessions = chatSessions.map((session) => {
      if (session.id === activeChat.id) {
        return {
          ...session,
          messages: [...session.messages, userMessage],
        };
      }
      return session;
    });

    setChatSessions(updatedSessions);
    setInputValue("");

    try {
      // Get Firebase token from cookie
      const cookies = parseCookies();
      const firebaseToken = cookies.clientToken;
      
      if (!firebaseToken) {
        console.error("No Firebase token found in cookies");
        toast.error("Authentication error. Please log in again.");
        router.push("/login");
        return;
      }
      
      // Prepare the messages array for the API
      const messages = activeChat.messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content
      }));

      // Add the new user message
      messages.push({
        role: "user",
        content: userMessage.content
      });

      // Log the messages being sent to API
      console.log("Sending messages to API:", messages);

      // Create a placeholder for the AI response
      const aiResponseId = `msg-${Date.now()}-2`;
      setStreamingMessageId(aiResponseId);
      const placeholder: Message = {
        id: aiResponseId,
        content: "",
        sender: "assistant",
        timestamp: new Date(),
        results: {
          type: "text",
          data: [],
          columns: [],
          sql: "",
          title: "",
          description: "",
          chartData: [],
          chartConfig: {}
        }
      };

      // Add the placeholder to state
      setChatSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeChat.id) {
            return {
              ...session,
              messages: [...session.messages, placeholder],
            };
          }
          return session;
        })
      );

      // Debug: Log placeholder message
      console.log("Added placeholder message:", placeholder);

      // Call the streaming chat API
      const response = await fetch(`/api/connections/${activeChat.connectionId}/query/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          messages,
          chatId: activeChat.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response from AI");
      }

      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response stream not available");
      }

      const decoder = new TextDecoder();
      let streamedText = "";
      let responseJson: QueryResponseJson | null = null;

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert chunk to text and add to accumulated text
        const chunk = decoder.decode(value, { stream: true });
        streamedText += chunk;

        // Try to parse the accumulated text as JSON as we receive chunks
        try {
          responseJson = JSON.parse(streamedText) as QueryResponseJson;
          // We successfully parsed the JSON, update the UI with the current content
          setChatSessions((prev) =>
            prev.map((session) => {
              if (session.id === activeChat.id) {
                const updatedMessages = session.messages.map((msg) => {
                  if (msg.id === aiResponseId) {
                    // Generate content based on response type
                    let content = responseJson?.explanation || streamedText;
                    
                    // Format results as Markdown for table type responses
                    if (responseJson?.outputType === 'table' && responseJson?.data) {
                      const markdownTable = generateMarkdownTable(responseJson.data);
                      const sqlBlock = responseJson.sql ? `\`\`\`sql\n${responseJson.sql}\n\`\`\`` : '';
                      const explanation = responseJson.explanation || '';
                      
                      content = `${explanation}`;
                      
                      // Add debug information 
                      console.log("Table data received:", responseJson.data);
                      console.log("Generated markdown table:", markdownTable);
                    }
                    
                    return {
                      ...msg,
                      content: content,
                      results: responseJson ? {
                        type: responseJson.outputType as "table" | "chart" | "both" || "text",
                        chartType: responseJson.chartSpec?.type,
                        data: responseJson.data?.rows || [],
                        columns: responseJson.data?.columns || [],
                        sql: responseJson.sql || '',
                        title: responseJson.chartSpec?.title || '',
                        description: responseJson.explanation || '',
                        // Add chart data for new format
                        chartData: responseJson.chartData || [],
                        chartConfig: responseJson.chartConfig || {}
                      } : undefined,
                    };
                  }
                  return msg;
                });
                return { ...session, messages: updatedMessages };
              }
              return session;
            })
          );
        } catch (e) {
          // Not valid JSON yet, just update the streamed text
          setChatSessions((prev) =>
            prev.map((session) => {
              if (session.id === activeChat.id) {
                const updatedMessages = session.messages.map((msg) => {
                  if (msg.id === aiResponseId) {
                    return {
                      ...msg,
                      content: streamedText,
                    };
                  }
                  return msg;
                });
                return { ...session, messages: updatedMessages };
              }
              return session;
            })
          );
        }
      }

      // Final update after stream completion
      if (responseJson) {
        // Already parsed the complete response
        // No additional processing needed
      } else {
        // Try one last time to parse the complete streamed text
        try {
          responseJson = JSON.parse(streamedText) as QueryResponseJson;
        } catch (e) {
          console.error("Could not parse streamed response as JSON:", e);
          // Keep the streamed text as is
        }
      }

      // Stream completed successfully
      setStreamingMessageId(null);

    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add an error message to the chat
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : "Sorry, I encountered an error while processing your request. Please try again.",
        sender: "assistant",
        timestamp: new Date(),
      };

      setChatSessions((prev) =>
        prev.map((session) => {
          if (session.id === activeChat.id) {
            return {
              ...session,
              messages: [...session.messages, errorMessage],
            };
          }
          return session;
        }),
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  // Handle creating a new database connection
  const handleAddDatabase = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.uid) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    try {
      // Validate the form data
      const name = formData.get("name") as string;
      const host = formData.get("host") as string;
      const username = formData.get("username") as string;
      const password = formData.get("password") as string;
      const database = formData.get("database") as string;
      const port = formData.get("port") as string;
      
      if (!name.trim()) {
        throw new Error('Connection name is required');
      }
      
      if (!host.trim()) {
        throw new Error('Host or connection string is required');
      }
      
      // Create the connection data object
      const connectionData = {
        name,
        type: "postgresql", // Always PostgreSQL for now
        host,
        username,
        password,
        database,
        port: port || "5432", // Default PostgreSQL port
      }
      
      // Get Firebase token from cookie that AuthContext previously set
      const cookies = parseCookies();
      const firebaseToken = cookies.clientToken;
      
      if (!firebaseToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // LOGGING: Log the connection data and token
      console.log('[handleAddDatabase] connectionData:', connectionData);
      console.log('[handleAddDatabase] Authorization header:', `Bearer ${firebaseToken}`);
      
      // Create connection via API
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify(connectionData),
      });
      
      // LOGGING: Log the response status and body
      console.log('[handleAddDatabase] /api/connections response:', response.status, response.statusText);
      let responseBody;
      try {
        responseBody = await response.clone().json();
      } catch (e) {
        responseBody = await response.text();
      }
      console.log('[handleAddDatabase] /api/connections response body:', responseBody);
      
      if (!response.ok) {
        // Try to get a more specific error message from the response
        const errorData = typeof responseBody === 'object' ? responseBody : { error: responseBody };
        throw new Error(errorData.error || 'Failed to create database connection');
      }
      
      const newConnection = responseBody;
      
      // Show success message
      toast.success("Connection Added", {
        description: `Successfully connected and saved '${connectionData.name}'.`,
      });
      
      // Close the modal if it exists
      if (typeof setShowNewConnectionDialog === 'function') {
        setShowNewConnectionDialog(false);
      }
      
      // Add to local state
      setDatabases([...databases, {
        id: newConnection.id,
        name: newConnection.name,
        type: newConnection.type,
        host: newConnection.host,
        status: newConnection.status,
      }]);
      
      setShowNewConnectionDialog(false);
    } catch (error) {
      console.error("Error creating database connection:", error);
      
      // Display a user-friendly error message
      let errorMessage = 'Failed to create database connection. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error("Connection Failed", {
        description: errorMessage,
      });
    }
  }

  // Handle creating a new chat session
  const handleAddChat = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.uid) return
    
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const dbId = formData.get("database") as string
    const chatName = formData.get("name") as string

    try {
      // Get Firebase token from cookie for authentication
      const cookies = parseCookies();
      const firebaseToken = cookies.clientToken;
      
      if (!firebaseToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create chat via API
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          title: chatName,
          connectionId: dbId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const newChat = await response.json();
      
      // Format messages for the app
      const formattedMessages: Message[] = newChat.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp || msg.createdAt),
        message_type: msg.message_type,
        results: msg.results,
      }));
      
      // Add to local state
      const newChatWithMessages: ChatSession = {
        id: newChat.id,
        title: newChat.name,
        connectionId: newChat.connection_id,
        messages: formattedMessages,
        createdAt: new Date(newChat.created_at),
      };
      
      setChatSessions([...chatSessions, newChatWithMessages]);
      setActiveTab(newChat.id);
      setShowNewChatDialog(false);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Chat Creation Failed", {
        description: "Failed to create chat. Please try again.",
      });
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Helper function to generate Markdown table from data
  const generateMarkdownTable = (data: { columns: string[], rows: any[][] }) => {
    if (!data.columns || !data.rows) return '';
    
    // Create header row
    let markdown = '| ' + data.columns.join(' | ') + ' |\n';
    
    // Create separator row
    markdown += '| ' + data.columns.map(() => '---').join(' | ') + ' |\n';
    
    // Create data rows
    data.rows.forEach(row => {
      markdown += '| ' + row.map(cell => formatCell(cell)).join(' | ') + ' |\n';
    });
    
    return markdown;
  };
  
  // Helper function to format cell values
  const formatCell = (value: any) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') {
      // Format currency if it appears to be money
      if (value % 1 === 0 && value > 100) {
        return value.toLocaleString();
      }
      return value.toString();
    }
    return value.toString();
  };

  // Render a message in the chat
  const renderMessage = (message: Message) => {
    const isStreaming = message.id === streamingMessageId;
    const hasContent = message.content.trim().length > 0;
    
    // Default view preference for this message (table unless chart is specified)
    const defaultView = message.results?.type === "chart" ? "chart" : "table";
    
    // Get current view preference for this message
    const currentView = messageViewPreferences[message.id] || defaultView;
    
    // Set view preference for a specific message
    const setViewPreference = (view: "table" | "chart") => {
      setMessageViewPreferences(prev => ({
        ...prev,
        [message.id]: view
      }));
    };

    // Function to render SQL code block
    const renderSqlBlock = () => {
      if (!message.results?.sql) return null;
      
      return (
        <div className="mt-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Code className="h-4 w-4 text-zinc-400" />
            <span className="text-xs text-zinc-400 font-medium">SQL Query</span>
          </div>
          <pre className="bg-zinc-800 text-green-400 p-3 rounded-md text-sm whitespace-pre-wrap">
            <code>{message.results.sql}</code>
          </pre>
        </div>
      );
    };

    // Function to render view toggle buttons
    const renderViewToggle = () => {
      if (!message.results || !message.results.data || message.results.data.length === 0) return null;
      
      // Only show toggle if we have chart data or can display a chart
      const canShowChart = message.results.type === "chart" || message.results.type === "both" || 
                          (message.results.chartData && message.results.chartData.length > 0);
      
      if (!canShowChart) return null;
      
      return (
        <div className="inline-flex items-center gap-1 mt-4 mb-2 p-1 bg-zinc-800 rounded-md">
          <Button 
            size="sm" 
            onClick={() => setViewPreference("table")}
            className={`h-7 px-3 transition-colors ${
              currentView === "table" 
                ? "bg-black text-white rounded" 
                : "bg-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <TableIcon className="h-4 w-4 mr-1" />
            Table
          </Button>
          <Button 
            size="sm" 
            onClick={() => setViewPreference("chart")}
            className={`h-7 px-3 transition-colors ${
              currentView === "chart" 
                ? "bg-black text-white rounded" 
                : "bg-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart2 className="h-4 w-4 mr-1" />
            Chart
          </Button>
        </div>
      );
    };

    // Determine if message has chart/table
    const hasVisualization = message.results && message.results.data && message.results.data.length > 0;

    return (
      <div key={message.id} className="mb-4 w-full">
        <div className={`flex justify-${message.sender === "user" ? "end" : "start"} w-full`}>
          <div className={`flex items-start max-w-[50%] ${hasVisualization ? "w-full md:w-auto md:min-w-[400px]" : ""} ${
            message.sender === "user" 
              ? "bg-zinc-100 text-zinc-900 rounded-lg"
              : "bg-zinc-900 text-zinc-100 rounded-lg"
          }`}>
            <div className={`flex-shrink-0 p-3 ${message.sender === "user" ? "order-last" : ""}`}>
              {message.sender === "user" ? (
                <div className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-zinc-800" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-zinc-200" />
                </div>
              )}
            </div>
            <div className="flex-1 p-3 overflow-hidden">
              {/* User message rendering remains unchanged */}
              {message.sender === "user" ? (
                <div className="prose dark:prose-invert max-w-none">
                  {message.content}
                  {isStreaming && !hasContent && <ThinkingIndicator />}
                </div>
              ) : (
                /* AI Message with enhanced structure */
                <div className="w-full">
                  {/* If message_type is query_result and results exist, prioritize rich rendering */}
                  {message.message_type === 'query_result' && message.results ? (
                    <>
                      {/* Summary/Explanation */}
                      {message.results.description && (
                        <div className="text-sm text-zinc-200 mb-3">
                          {message.results.description}
                        </div>
                      )}
                      {/* SQL Block */}
                      {renderSqlBlock()}
                      {/* Toggle View */}
                      {renderViewToggle()}
                      {/* Results: Table or Chart based on current view */}
                      {hasVisualization && (
                        <div className="mt-2 bg-zinc-950 rounded-md overflow-hidden border border-zinc-800 w-full">
                          {currentView === "table" ? (
                            <MessageTableView results={message.results!} />
                          ) : (
                            <div className="h-[300px] p-4 bg-black rounded-md w-full">
                              <MessageChartView results={message.results!} />
                            </div>
                          )}
                        </div>
                      )}
                      {/* Optional Footer Note */}
                      {message.results.title && (
                        <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-800 mt-2">
                          {message.results.title}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="prose dark:prose-invert max-w-none">
                      {message.content && !message.content.includes('|') && !message.content.includes('```') ? (
                        <p>{message.content}</p>
                      ) : message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : null}
                      {isStreaming && !hasContent && <ThinkingIndicator />}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-xs mt-2 opacity-75">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update the charts display container to be full width and responsive
  const MessageChartView = ({ results }: { results: QueryResult }) => {
    if (!results || !results.data) {
      return (
        <div className="flex items-center justify-center h-full text-zinc-500">
          No chart data available
        </div>
      );
    }

    // Use the QueryChart component if chartData and chartConfig are available
    if (results.chartData && results.chartData.length > 0 && results.chartConfig) {
      return (
        <div className="w-full h-full">
          <QueryChart 
            title={results.title || "Data Visualization"} 
            description={results.description || "Query results visualization"} 
            data={results.chartData} 
            onDelete={() => {}} 
          />
        </div>
      );
    }

    // If we have data and columns, render a chart based on the specified type
    if (results.data && results.columns) {
      // Get the chart type from results or default to bar chart if not specified
      const chartType = results.chartType || "bar";
      
      return (
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" || chartType === "column" ? (
            <RechartsBarChart 
              data={results.data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={results.columns[0]} stroke="#999" />
              <YAxis stroke="#999" domain={[0, 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
              <Legend />
              {results.columns.slice(1).map((column, idx) => (
                <Bar key={idx} dataKey={column} fill={`hsl(${(idx * 40) % 360}, 70%, 60%)`} />
              ))}
            </RechartsBarChart>
          ) : chartType === "pie" ? (
            <PieChart>
              <Pie
                data={results.data.map(item => ({
                  name: item[results.columns[0]],
                  value: item[results.columns[1]],
                }))}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {results.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${(index * 40) % 360}, 70%, 60%)`} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}`, results.columns[1]]}
                contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }}
              />
              <Legend />
            </PieChart>
          ) : chartType === "line" || chartType === "area" ? (
            <LineChart 
              data={results.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={results.columns[0]} stroke="#999" />
              <YAxis stroke="#999" domain={[0, 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
              <Legend />
              {results.columns.slice(1).map((column, idx) => (
                <Line 
                  key={idx} 
                  type="monotone" 
                  dataKey={column} 
                  stroke={`hsl(${(idx * 40) % 360}, 70%, 60%)`}
                  strokeWidth={2}
                  fill={chartType === "area" ? `hsl(${(idx * 40) % 360}, 70%, 30%)` : undefined}
                  {...(chartType === "area" ? { fillOpacity: 0.3 } : {})}
                />
              ))}
            </LineChart>
          ) : chartType === "scatter" ? (
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 30, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={results.columns[0]} name={results.columns[0]} stroke="#999" />
              <YAxis dataKey={results.columns[1]} name={results.columns[1]} stroke="#999" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
              <Legend />
              <Scatter
                name={results.columns[1]}
                data={results.data}
                fill={`hsl(200, 70%, 60%)`}
              />
            </ScatterChart>
          ) : (
            // Fallback to bar chart if type is not recognized
            <RechartsBarChart 
              data={results.data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey={results.columns[0]} stroke="#999" />
              <YAxis stroke="#999" domain={[0, 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#555', color: '#fff' }} />
              <Legend />
              {results.columns.slice(1).map((column, idx) => (
                <Bar key={idx} dataKey={column} fill={`hsl(${(idx * 40) % 360}, 70%, 60%)`} />
              ))}
            </RechartsBarChart>
          )}
        </ResponsiveContainer>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        No chart data available
      </div>
    );
  };

  // Helper component for table view
  const MessageTableView = ({ results }: { results: QueryResult }) => {
    if (!results || !results.data || !results.columns || results.columns.length === 0) {
      return <div className="p-3 text-zinc-500">No data available</div>;
    }
    
    return (
      <div className="max-h-[400px] overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-900">
            <tr>
              {results.columns.map((column, idx) => (
                <th key={idx} className="text-xs text-zinc-400 uppercase font-medium px-3 py-2 text-left border-b border-zinc-800">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.data.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800 hover:bg-zinc-700"}>
                {Array.isArray(row) ? 
                  row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-3 py-2 text-zinc-100 text-sm border-b border-zinc-800">
                      {cell !== null && cell !== undefined ? String(cell) : ""}
                    </td>
                  )) : 
                  results.columns.map((column, cellIdx) => (
                    <td key={cellIdx} className="px-3 py-2 text-zinc-100 text-sm border-b border-zinc-800">
                      {row[column] !== null && row[column] !== undefined ? String(row[column]) : ""}
                    </td>
                  ))
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Function to add a chart
  const addChart = () => {
    if (queryResult.length > 0) {
      // Create a chart from the current query result
      const chartId = `chart-${Date.now()}`;
      const chartTitle = `Chart ${charts.length + 1}`;
      
      setCharts((prev) => [
        ...prev,
        { id: chartId, title: chartTitle, data: queryResult }
      ]);
    }
  };

  // Function to remove a chart
  const removeChart = (chartId: string) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== chartId));
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform border-r border-zinc-800 bg-zinc-950 transition-all duration-300 ease-in-out md:relative ${
          sidebarCollapsed ? "w-16" : "w-64"
        } ${showMobileMenu ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="QueryIO Logo"
              width={32}
              height={32}
              className="rounded"
            />
            {!sidebarCollapsed && <span className="text-xl font-bold">QueryIO</span>}
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(false)}>
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          <div className="p-4">
            <Button
              className={`w-full justify-center md:justify-start gap-2 bg-zinc-200 text-zinc-900 hover:bg-zinc-300 ${
                sidebarCollapsed ? "px-0" : ""
              }`}
              onClick={() => setShowNewChatDialog(true)}
            >
              <Plus className="h-4 w-4" />
              {!sidebarCollapsed && <span>New Chat</span>}
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-1">
              {!sidebarCollapsed && (
                <h3 className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Chats</h3>
              )}
              {chatSessions.map((chat) => (
                <button
                  key={chat.id}
                  className={`w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium ${
                    activeTab === chat.id
                      ? "bg-zinc-800 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  } ${sidebarCollapsed ? "justify-center" : "justify-start"}`}
                  onClick={() => setActiveTab(chat.id)}
                  title={sidebarCollapsed ? chat.title : undefined}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{chat.title}</span>}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-1">
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Databases</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-zinc-400"
                    onClick={() => setShowNewConnectionDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {databases.map((db) => (
                <div
                  key={db.id}
                  className={`flex items-center rounded-md px-2 py-1.5 text-sm ${
                    sidebarCollapsed ? "justify-center" : "justify-between"
                  }`}
                  title={sidebarCollapsed ? db.name : undefined}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className={db.status === "connected" ? "text-zinc-300" : "text-zinc-500"}>{db.name}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <div
                      className={`h-2 w-2 rounded-full ${db.status === "connected" ? "bg-zinc-300" : "bg-zinc-600"}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`w-full ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {user?.email ? user.email.substring(0, 2).toUpperCase() : "JD"}
                      </span>
                    </div>
                    {!sidebarCollapsed && <span className="text-sm font-medium">{user?.email || "User"}</span>}
                  </div>
                  {!sidebarCollapsed && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-100">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100" asChild>
                  <a href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-zinc-800 text-zinc-100"
          onClick={() => setShowMobileMenu(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 px-4 md:px-6 bg-zinc-950">
          <div className="flex items-center gap-2">
            {activeChat && (
              <>
                <MessageSquare className="h-5 w-5 text-zinc-400" />
                <h1 className="text-lg font-medium">{activeChat.title}</h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <BarChart2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <TableIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100" asChild>
              <a href="/settings">
                <Settings className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList>
              {console.log('Rendering chat tabs with titles:', chatSessions.map(c => c.title))}
              {chatSessions.map((chat) => (
                <TabsTrigger
                  key={chat.id}
                  value={chat.id}
                  className={"max-w-[180px] truncate"}
                >
                  {chat.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {chatSessions.map((chat) => (
              <TabsContent
                key={chat.id}
                value={chat.id}
                className="flex-1 overflow-hidden flex flex-col data-[state=active]:flex data-[state=inactive]:hidden"
              >
                <div className="flex-1 overflow-auto p-6 space-y-4 bg-black">
                  {chat.messages.map(message => renderMessage(message))}
                </div>

                <div className="border-t border-zinc-800 p-4 bg-zinc-950">
                  <div className="flex items-center gap-2">
                    <Input
                      className="flex-1 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-600"
                      placeholder="Ask a question about your data..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button 
                      className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900" 
                      size="icon" 
                      onClick={handleSendMessage}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-zinc-900 border-t-transparent rounded-full"/>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-center text-xs text-zinc-500">
                    Try: "Compare sales by region" or "Show me top 5 products by revenue"
                  </p>
                </div>
              </TabsContent>
            ))}

            {chatSessions.length === 0 && (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-zinc-600" />
                  <h3 className="mt-2 text-lg font-medium">No chats yet</h3>
                  <p className="mt-1 text-zinc-500">Create a new chat to start querying your database.</p>
                  <Button className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900" onClick={() => setShowNewChatDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>

      {/* New Database Connection Dialog */}
      <Dialog open={showNewConnectionDialog} onOpenChange={setShowNewConnectionDialog}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Add Database Connection</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Connect to your database to start querying with natural language.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDatabase}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-100">
                  Connection Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Database"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-zinc-100">
                  Database Type
                </Label>
                <Select name="type" defaultValue="postgresql">
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mysql">MySQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="sqlite">SQLite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="host" className="text-zinc-100">
                  Host
                </Label>
                <Input
                  id="host"
                  name="host"
                  placeholder="localhost or hostname"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="port" className="text-zinc-100">
                    Port
                  </Label>
                  <Input
                    id="port"
                    name="port"
                    placeholder="5432"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    defaultValue="5432"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="database" className="text-zinc-100">
                    Database
                  </Label>
                  <Input
                    id="database"
                    name="database"
                    placeholder="postgres"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-zinc-100">
                    Username
                  </Label>
                  <Input id="username" name="username" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-zinc-100">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                onClick={() => setShowNewConnectionDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">
                Connect
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Create a new chat session to query your database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddChat}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-zinc-100">
                  Chat Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Sales Analysis"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="database" className="text-zinc-100">
                  Select Database
                </Label>
                <Select name="database" defaultValue={databases[0]?.id}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select database" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    {databases.map((db) => (
                      <SelectItem key={db.id} value={db.id}>
                        {db.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 text-zinc-100 hover:bg-zinc-800"
                onClick={() => setShowNewChatDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
