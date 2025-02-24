import { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  Code,
  Settings2,
  Activity,
  MessageSquare,
  FileText,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGemini } from "@/hooks/useGemini";
import { CodeBlock } from "@/components/CodeBlock";
import { parseMessage } from "@/utils/messageFormatter";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function Index() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [systemMessage, setSystemMessage] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([4096]);
  const [isStreaming, setIsStreaming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    response,
    streamingResponse,
    isLoading,
    error,
    sendMessage: sendGeminiMessage,
    sendStreamingMessage: sendGeminiStreamingMessage,
  } = useGemini();

  // Efecto para actualizar los mensajes cuando hay una respuesta de streaming
  useEffect(() => {
    if (streamingResponse && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        // Actualizar el último mensaje si es del asistente
        setMessages(
          messages.map((msg, i) =>
            i === messages.length - 1
              ? { ...msg, content: streamingResponse }
              : msg
          )
        );
      } else {
        // Agregar nuevo mensaje del asistente
        setMessages([
          ...messages,
          { role: "assistant", content: streamingResponse },
        ]);
      }
    }
  }, [streamingResponse]);

  // Efecto para actualizar los mensajes cuando hay una respuesta normal
  useEffect(() => {
    if (response && messages.length > 0 && !isStreaming) {
      setMessages([...messages, { role: "assistant", content: response }]);
    }
  }, [response]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingResponse]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
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
      setInputMessage("");

      // Construir el prompt solo con el contenido de los mensajes
      const fullPrompt = newMessages.map((msg) => msg.content).join("\n");

      if (isStreaming) {
        // Agregar un mensaje temporal del asistente
        setMessages([...newMessages, { role: "assistant", content: "" }]);
        await sendGeminiStreamingMessage(fullPrompt);
      } else {
        await sendGeminiMessage(fullPrompt);
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      toast({
        title: "Error al enviar mensaje",
        description:
          "Hubo un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Efecto para inicialización
  useEffect(() => {
    try {
      setIsInitialized(true);
    } catch (error) {
      console.error("Error durante la inicialización:", error);
      toast({
        title: "Error de inicialización",
        description:
          "Hubo un problema al cargar la aplicación. Por favor, recarga la página.",
        variant: "destructive",
      });
    }
  }, []);

  // Si no está inicializado, mostrar un estado de carga
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="flex items-center space-x-2 justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"></div>
            <div
              className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"></div>
              <div
                className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-3 h-3 rounded-full bg-blue-500/50 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Cargando componentes...
            </p>
          </div>
        </div>
      }
    >
      <div className="flex h-screen bg-background pattern-bg overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border p-4 space-y-4 glass-morphism blur-bg">
          <div className="flex items-center space-x-2 mb-8 hover-scale hover-glow">
            <div className="h-8 w-8">
              <img
                src="/lovable-uploads/6eb9ed82-2c8b-4f90-b45b-3adb8339b9d4.png"
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-xl font-semibold gradient-text">Angel</span>
          </div>

          <nav className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover-scale hover-glow ripple-effect"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover-scale hover-glow ripple-effect"
            >
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover-scale hover-glow ripple-effect"
            >
              <Activity className="mr-2 h-4 w-4" />
              Metrics
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover-scale hover-glow ripple-effect"
            >
              <Code className="mr-2 h-4 w-4" />
              API Keys
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover-scale hover-glow ripple-effect"
            >
              <Settings2 className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b border-border p-4 flex justify-between items-center glass-morphism blur-bg">
            <Tabs defaultValue="chat" className="w-auto">
              <TabsList className="gradient-bg glow-border">
                <TabsTrigger value="chat" className="hover-glow">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="studio" className="hover-glow">
                  Studio
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="text-sm hover-scale hover-glow gradient-bg glow-border"
              >
                gemini-pro
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="default"
                className="text-sm hover-scale hover-glow gradient-bg glow-border"
              >
                <Code className="mr-2 h-4 w-4" />
                View code
              </Button>
            </div>
          </header>

          {/* Main Chat Area */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-semibold text-glow">
                        ¡Bienvenido al Chat con Gemini!
                      </h2>
                      <p className="text-muted-foreground">
                        Comienza una conversación escribiendo un mensaje.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      {message.role === "assistant" ? (
                        <div className="flex items-start max-w-[80%] fade-in">
                          <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                            <img
                              src="/lovable-uploads/6eb9ed82-2c8b-4f90-b45b-3adb8339b9d4.png"
                              alt=""
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                          <div className="text-sm leading-relaxed text-gray-100">
                            {parseMessage(message.content).map(
                              (block, blockIndex) =>
                                block.type === "code" ? (
                                  <CodeBlock
                                    key={blockIndex}
                                    code={block.content}
                                    language={block.language}
                                  />
                                ) : (
                                  <p
                                    key={blockIndex}
                                    className="mb-3 last:mb-0 whitespace-pre-wrap"
                                  >
                                    {block.content}
                                  </p>
                                )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/30 transition-all max-w-[80%] fade-in">
                          <p className="text-sm text-gray-100 whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isLoading && !streamingResponse && (
                  <div className="flex items-start max-w-[80%] fade-in">
                    <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                      <img
                        src="/lovable-uploads/6eb9ed82-2c8b-4f90-b45b-3adb8339b9d4.png"
                        alt=""
                        className="w-5 h-5 object-contain"
                      />
                    </div>
                    <div className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20">
                      <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="mt-4 flex space-x-4 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="w-full bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-sm border-blue-500/20 hover:border-blue-500/30 transition-all rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="absolute right-2 bottom-1.5 p-1.5 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Send className="h-4 w-4 text-blue-500" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="w-80 border-l border-border p-6 glass-morphism blur-bg">
              <h3 className="text-lg font-semibold mb-6">Configuración</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground">
                    Temperature: {temperature[0]}
                  </label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">
                    Max Tokens: {maxTokens[0]}
                  </label>
                  <Slider
                    value={maxTokens}
                    onValueChange={setMaxTokens}
                    max={8192}
                    step={100}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-muted-foreground">
                      Streaming
                    </label>
                    <Switch
                      checked={isStreaming}
                      onCheckedChange={setIsStreaming}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
