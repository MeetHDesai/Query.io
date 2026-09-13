import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdminService } from "@/lib/supabase-admin"

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const chats = await supabaseAdminService.getChatsByUserId(session.user.id)
  
  // For each chat, get its messages
  const chatsWithMessages = await Promise.all(chats.map(async (chat) => {
    const messages = await supabaseAdminService.getMessagesByChatId(chat.id)
    return {
      ...chat,
      messages,
    }
  }))
  
  return NextResponse.json(chatsWithMessages)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const data = await req.json()
    
    // Create new chat
    const newChat = await supabaseAdminService.createChat({
      title: data.title,
      connection_id: data.connectionId,
    })
    
    // Get the initial welcome message
    const messages = await supabaseAdminService.getMessagesByChatId(newChat.id)
    
    return NextResponse.json({
      ...newChat,
      messages,
      title: newChat.title,
      connectionId: newChat.connection_id,
    })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 })
  }
} 