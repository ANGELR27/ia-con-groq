import { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  Mic,
  MicOff,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGemini } from "@/hooks/useGemini";
import { CodeBlock } from "@/components/CodeBlock";
import { parseMessage } from "@/utils/messageFormatter";
import React from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
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
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setSelectedImages((prev) => [...prev, ...newFiles]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setInputMessage("");

      toast({
        title: "Imágenes añadidas",
        description: `Se han añadido ${files.length} imágenes`,
      });
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;

    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        event.preventDefault();

        const file = items[i].getAsFile();
        if (file) {
          const previewUrl = URL.createObjectURL(file);
          setSelectedImages((prev) => [...prev, file]);
          setImagePreviews((prev) => [...prev, previewUrl]);
          setInputMessage("");

          toast({
            title: "Imagen pegada",
            description: "La imagen se ha añadido correctamente",
          });
        }
        break;
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && selectedImages.length === 0 && !selectedFile)
      return;

    try {
      const userMessage: Message = {
        role: "user",
        content: inputMessage,
        images: imagePreviews,
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

      // Construir el prompt incluyendo las imágenes
      const fullPrompt = `${newMessages
        .map((msg) => {
          if (msg.images && msg.images.length > 0) {
            return `${msg.content}\n[Imágenes adjuntas: ${msg.images.length}]`;
          }
          return msg.content;
        })
        .join("\n")}`;

      if (isStreaming) {
        const emptyResponse: Message = {
          role: "assistant",
          content: "",
          images: [],
        };
        setMessages([...newMessages, emptyResponse]);
        const streamResponse = await sendGeminiStreamingMessage(fullPrompt);
        if (streamResponse) {
          const responseImages = extractImagesFromResponse(streamResponse);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              ...emptyResponse,
              content: streamResponse,
              images: responseImages,
            },
          ]);
        }
      } else {
        const response = await sendGeminiMessage(fullPrompt);
        if (response) {
          const responseImages = extractImagesFromResponse(response);
          setMessages([
            ...newMessages,
            { role: "assistant", content: response, images: responseImages },
          ]);
        }
      }

      setImagePreviews([]);
      setSelectedImages([]);
      setSelectedFile(null);
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

  // Función auxiliar para extraer URLs de imágenes de la respuesta
  const extractImagesFromResponse = (response: string): string[] => {
    const imageUrls: string[] = [];
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;

    while ((match = imageRegex.exec(response)) !== null) {
      imageUrls.push(match[1]);
    }

    return imageUrls;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setInputMessage(`[Archivo adjunto: ${file.name}]`);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Aquí iría la lógica para iniciar la grabación
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setIsRecording(true);
          // Aquí se iniciaría la grabación
          toast({
            title: "Grabación iniciada",
            description: "Habla para grabar tu mensaje",
          });
        })
        .catch((err) => {
          toast({
            title: "Error al acceder al micrófono",
            description: "No se pudo acceder al micrófono",
            variant: "destructive",
          });
        });
    } else {
      // Aquí iría la lógica para detener la grabación
      setIsRecording(false);
      toast({
        title: "Grabación detenida",
        description: "Mensaje de voz guardado",
      });
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
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-4 flex flex-col overflow-hidden relative">
              {/* Espacio superior y capa de difuminado */}
              <div className="h-12"></div>
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/90 to-transparent z-10 pointer-events-none"></div>

              <div className="flex-1 overflow-y-auto space-y-8 px-10 pr-10 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">Inicia una conversación...</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index}>
                      <div
                        className={`flex items-start gap-4 ${
                          message.role === "user"
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <div
                          className={`rounded-3xl p-4 inline-block ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 text-right"
                              : "bg-gradient-to-br from-gray-500/10 to-gray-600/10 backdrop-blur-sm border border-gray-500/20"
                          }`}
                        >
                          {message.role === "user" ? (
                            <div className="flex flex-col gap-2">
                              {message.images &&
                                message.images.map((image, imageIndex) => (
                                  <div
                                    key={imageIndex}
                                    className="flex justify-end"
                                  >
                                    <img
                                      src={image}
                                      alt={`Imagen adjunta ${imageIndex + 1}`}
                                      className="max-w-[400px] w-auto h-auto object-contain"
                                    />
                                  </div>
                                ))}
                              {message.content && (
                                <p className="whitespace-pre-wrap text-sm text-left">
                                  {message.content}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="prose prose-invert max-w-none">
                              {message.images &&
                                message.images.map((image, imageIndex) => (
                                  <div
                                    key={imageIndex}
                                    className="flex justify-start mb-4"
                                  >
                                    <img
                                      src={image}
                                      alt={`Imagen generada ${imageIndex + 1}`}
                                      className="max-w-[400px] w-auto h-auto object-contain hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                ))}
                              {parseMessage(message.content).map(
                                (block, blockIndex) => (
                                  <React.Fragment key={blockIndex}>
                                    {block.type === "code" ? (
                                      <CodeBlock
                                        code={block.content}
                                        language={block.language}
                                      />
                                    ) : (
                                      <p
                                        className="mb-3 last:mb-0 whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                          __html: block.content,
                                        }}
                                      />
                                    )}
                                  </React.Fragment>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && !streamingResponse && (
                  <div className="flex items-start gap-3 max-w-[80%] fade-in">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="mb-4 mt-2 relative px-10">
                {imagePreviews.length > 0 && (
                  <div className="absolute bottom-full right-10 mb-2 p-2 bg-background/30 backdrop-blur-sm rounded-lg animate-[slideDown_0.3s_ease-out] shadow-lg border border-blue-500/30">
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Vista previa ${index + 1}`}
                            className="h-16 w-16 object-cover rounded-md transition-all duration-300 hover:scale-105"
                          />
                          <Button
                            onClick={() => removeImage(index)}
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/50 hover:bg-red-600/50 transition-colors duration-300 opacity-0 group-hover:opacity-100"
                          >
                            <span className="sr-only">Eliminar imagen</span>×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-background/30 backdrop-blur-sm rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ImageIcon className="h-5 w-5" />
                      <span className="sr-only">Adjuntar imagen</span>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={toggleRecording}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      disabled={isRecording}
                    >
                      <Mic className="h-5 w-5" />
                      <span className="sr-only">Grabar audio</span>
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Paperclip className="h-5 w-5" />
                      <span className="sr-only">Adjuntar archivo</span>
                    </Button>
                  </div>
                  <div className="relative flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onPaste={handlePaste}
                      placeholder="Escribe tu mensaje..."
                      className="w-full bg-background/30 backdrop-blur-sm border border-blue-500/20 rounded-3xl pl-3 pr-10 py-1.5 text-base placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 hover:border-blue-500/30 transition-all duration-300"
                      disabled={isLoading || isRecording}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={
                        isLoading ||
                        (!inputMessage.trim() &&
                          selectedImages.length === 0 &&
                          !selectedFile) ||
                        isRecording
                      }
                      className={`absolute right-1 bottom-0.5 p-1.5 rounded-2xl transition-all duration-500 transform hover:scale-105
                        ${
                          (inputMessage.trim() ||
                            selectedImages.length > 0 ||
                            selectedFile) &&
                          !isRecording
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-blue-500/50"
                            : "bg-gray-700/50"
                        }`}
                    >
                      <Send
                        className={`h-4 w-4 ${
                          (inputMessage.trim() ||
                            selectedImages.length > 0 ||
                            selectedFile) &&
                          !isRecording
                            ? "text-white"
                            : "text-gray-400"
                        } transition-transform duration-300 group-hover:rotate-45`}
                      />
                      <span className="sr-only">Enviar mensaje</span>
                    </Button>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Panel de Estadísticas */}
            <div className="w-80 border-l border-border p-6 bg-black/80 backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Estadísticas del Chat
              </h3>

              <div className="space-y-6">
                <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-border-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Mensajes Totales
                    </span>
                    <span className="text-lg font-semibold text-blue-400">
                      {messages.length}
                    </span>
                  </div>
                  <div className="h-1 bg-background/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (messages.length / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-border-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground block mb-1">
                        Tus mensajes
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        {messages.filter((m) => m.role === "user").length}
                      </span>
                    </div>
                  </div>
                  <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-border-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground block mb-1">
                        Respuestas
                      </span>
                      <span className="text-2xl font-bold text-blue-400">
                        {messages.filter((m) => m.role === "assistant").length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-border-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                    Actividad Reciente
                  </h4>
                  <div className="space-y-2">
                    {messages
                      .slice(-3)
                      .reverse()
                      .map((message, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              message.role === "user"
                                ? "bg-blue-400"
                                : "bg-gray-400"
                            }`}
                          />
                          <span className="text-muted-foreground">
                            {message.role === "user" ? "Tú" : "Angel"}:
                            {message.content.substring(0, 20)}...
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-transparent p-4 rounded-xl backdrop-blur-sm border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-border-glow hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                  <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                    Estado
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-muted-foreground">
                          Conexión
                        </span>
                        <span className="text-sm text-green-400">Activa</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Modo
                        </span>
                        <span className="text-sm text-blue-400">Streaming</span>
                      </div>
                    </div>
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
