import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_API_KEY = "AIzaSyApFuPXdcHpaPZVm__wqk7ivzJUpVYD7LY";

// Inicializar el cliente de Gemini
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Obtener el modelo
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

// Función para generar chat
export const generateChat = async (prompt: string) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    throw error;
  }
};

// Función para generar chat con streaming
export const generateChatStream = async (
  prompt: string,
  handlePartialResponse: (text: string) => void
) => {
  try {
    const model = getGeminiModel();
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      handlePartialResponse(chunkText);
    }
  } catch (error) {
    console.error("Error en el streaming:", error);
    throw error;
  }
};
