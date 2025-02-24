import { useState, useRef, useEffect } from "react";
import { Mic, Image, Paperclip, Send } from "lucide-react";
import "../styles/chat-input.css";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  onImageUpload?: (image: File) => void;
  isAITyping?: boolean;
  isChatEmpty?: boolean;
}

export const ChatInput = ({
  onSendMessage,
  onFileUpload,
  onImageUpload,
  isAITyping = false,
  isChatEmpty = true,
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCompressed, setIsCompressed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((isAITyping || !isChatEmpty) && isCompressed) {
      setIsCompressed(false);
    } else if (isChatEmpty && !isAITyping && !isCompressed) {
      setIsCompressed(true);
    }
  }, [isAITyping, isChatEmpty, isCompressed]);

  // Manejo de archivos
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  // Manejo de imágenes
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  // Manejo de grabación de voz
  const handleVoiceRecord = async () => {
    try {
      if (!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        // Aquí iría la lógica de grabación
        setIsRecording(true);
      } else {
        // Aquí iría la lógica para detener la grabación
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`chat-input-container ${
        isCompressed ? "compressed" : "expanding"
      }`}
    >
      <div className="chat-input-wrapper">
        <div className="relative flex items-center gap-2 bg-[rgba(18,18,24,0.7)] backdrop-blur-md border border-[rgba(65,149,252,0.3)] rounded-xl p-2 shadow-lg transition-all duration-300">
          {/* Botones de acción */}
          <div className="flex items-center gap-2 px-2">
            <button
              onClick={handleFileClick}
              className="action-button p-2 rounded-full hover:bg-[rgba(65,149,252,0.15)] transition-all duration-200"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleImageClick}
              className="action-button p-2 rounded-full hover:bg-[rgba(65,149,252,0.15)] transition-all duration-200"
              title="Adjuntar imagen"
            >
              <Image className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleVoiceRecord}
              className={`action-button p-2 rounded-full transition-all duration-200 ${
                isRecording
                  ? "recording bg-red-500/20 text-red-500"
                  : "hover:bg-[rgba(65,149,252,0.15)] text-gray-400"
              }`}
              title={isRecording ? "Detener grabación" : "Grabar audio"}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>

          {/* Campo de texto */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe un mensaje..."
            className="chat-input flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500"
          />

          {/* Botón enviar */}
          <button
            onClick={handleSend}
            className={`send-button p-2 rounded-full transition-all duration-200 ${
              message.trim()
                ? "text-[#4195fc] hover:bg-[rgba(65,149,252,0.15)]"
                : "text-gray-600"
            }`}
            disabled={!message.trim()}
          >
            <Send className="w-5 h-5" />
          </button>

          {/* Inputs ocultos para archivos e imágenes */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
