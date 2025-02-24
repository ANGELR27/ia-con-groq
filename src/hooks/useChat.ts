import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatConfig {
  temperature: number;
  maxTokens: number;
  isStreaming: boolean;
  isJsonMode: boolean;
}

export function useChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [systemMessage, setSystemMessage] = useState("");

  const sendMessage = useCallback(
    async (inputMessage: string, config: ChatConfig) => {
      if (!inputMessage.trim()) return;

      try {
        setIsLoading(true);
        const userMessage: Message = {
          role: "user",
          content: inputMessage,
        };

        let newMessages: Message[] = [...messages, userMessage];

        if (systemMessage && messages.length === 0) {
          const systemMsg: Message = {
            role: "system",
            content: systemMessage,
          };
          newMessages = [systemMsg, ...newMessages];
        }

        setMessages(newMessages);

        const response = await supabase.functions.invoke("chat", {
          body: {
            messages: newMessages,
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: config.isStreaming,
            json_mode: config.isJsonMode,
          },
        });

        if (response.error) {
          throw response.error;
        }

        if (config.isStreaming) {
          const reader = response.data.getReader();
          const decoder = new TextDecoder();
          let partialResponse = "";

          const assistantMessage: Message = {
            role: "assistant",
            content: "",
          };
          setMessages([...newMessages, assistantMessage]);

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.choices?.[0]?.delta?.content) {
                      partialResponse += data.choices[0].delta.content;
                      setMessages((msgs) => {
                        const updatedMsgs = [...msgs];
                        updatedMsgs[updatedMsgs.length - 1].content =
                          partialResponse;
                        return updatedMsgs;
                      });
                    }
                  } catch (e) {
                    console.error("Error parsing SSE message:", e);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error reading stream:", error);
            throw error;
          } finally {
            reader.releaseLock();
          }
        } else {
          if (!response.data?.choices?.[0]?.message) {
            throw new Error("Formato de respuesta inválido");
          }

          const assistantMessage: Message = {
            role: "assistant",
            content: response.data.choices[0].message.content,
          };

          setMessages([...newMessages, assistantMessage]);
        }
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
        toast({
          title: "Error al enviar mensaje",
          description:
            "Hubo un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, systemMessage, toast]
  );

  return {
    messages,
    isLoading,
    systemMessage,
    setSystemMessage,
    sendMessage,
    setMessages,
  };
}
