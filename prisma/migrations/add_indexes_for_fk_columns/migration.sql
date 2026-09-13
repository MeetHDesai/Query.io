-- Add index for chat_threads.connection_id
CREATE INDEX IF NOT EXISTS idx_chat_threads_connection_id ON chat_threads (connection_id);

-- Add index for chat_messages.thread_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages (thread_id); 