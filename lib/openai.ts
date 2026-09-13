import OpenAI from 'openai';
import { StreamingTextResponse, OpenAIStream } from 'ai';
import { logger } from './logger';

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('OpenAI API key must be provided in environment variables');
}

export const openai = new OpenAI({
  apiKey: openaiApiKey,
});

/**
 * Function to create a streaming completion
 * @param messages Array of message objects with role and content
 * @returns StreamingTextResponse for client-side consumption
 */
export async function streamCompletion(messages: any[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
    stream: true,
  });

  // Convert the response to a stream using OpenAIStream
  // Cast the stream to the expected type to avoid TypeScript errors
  // This is necessary due to differences in type definitions between OpenAI SDK versions
  const stream = OpenAIStream(response as any);
  
  // Return a StreamingTextResponse
  return new StreamingTextResponse(stream);
}

/**
 * Function to get a non-streaming completion, with optional configuration
 * @param messages Array of message objects with role and content
 * @param options Optional configuration for the completion
 * @returns The generated completion text
 */
export async function getCompletion(messages: any[], options: Record<string, any> = {}) {
  try {
    // Merge default options with provided options
    const completionOptions = {
      model: options.model || 'gpt-4',
      messages,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      max_tokens: options.max_tokens || undefined,
      response_format: options.response_format || undefined,
    };

    logger.info('Requesting completion from OpenAI', { model: completionOptions.model });
    
    const response = await openai.chat.completions.create(completionOptions);
    
    // Return just the content of the completion
    return response.choices[0].message.content;
  } catch (error: any) {
    logger.error('Error getting completion from OpenAI:', { error: error.message });
    throw error;
  }
}

export default openai;