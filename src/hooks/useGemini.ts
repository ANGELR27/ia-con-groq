import { useState, useCallback } from "react";
import { generateChat, generateChatStream } from "../config/gemini";

interface UseGeminiReturn {
  response: string;
  isLoading: boolean;
  error: Error | null;
  streamingResponse: string;
  sendMessage: (prompt: string) => Promise<void>;
  sendStreamingMessage: (prompt: string) => Promise<void>;
  resetResponses: () => void;
}

export const useGemini = (): UseGeminiReturn => {
  const [response, setResponse] = useState<string>("");
  const [streamingResponse, setStreamingResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const resetResponses = useCallback(() => {
    setResponse("");
    setStreamingResponse("");
    setError(null);
  }, []);

  const sendMessage = useCallback(async (prompt: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setResponse("");
      const result = await generateChat(prompt);
      setResponse(result);
    } catch (err) {
      setError(err as Error);
      console.error("Error en sendMessage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendStreamingMessage = useCallback(async (prompt: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setStreamingResponse("");

      await generateChatStream(prompt, (partialResponse) => {
        setStreamingResponse((prev) => {
          const newResponse = prev + partialResponse;
          return newResponse;
        });
      });
    } catch (err) {
      setError(err as Error);
      console.error("Error en sendStreamingMessage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    response,
    isLoading,
    error,
    streamingResponse,
    sendMessage,
    sendStreamingMessage,
    resetResponses,
  };
};
