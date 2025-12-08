import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptItem } from "../types";

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getAiClient = () => {
  // Preferir la variable de entorno de Vite; fallback a process.env si existe
  // const apiKey = (import.meta as any).env?.GEN_API_KEY || (process.env as any).GEN_API_KEY;
  const apiKey =  (process.env as any).GEN_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Create .env with GEN_API_KEY or set process.env.API_KEY :(');
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeReceipts = async (files: File[]): Promise<ReceiptItem[]> => {
  const ai = getAiClient();
  const parts = [];

  // Add all images
  for (const file of files) {
    const base64Data = await fileToBase64(file);
    parts.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    });
  }

  // Add the prompt
  parts.push({
    text: "Analiza estas imágenes de boletas/recibos. Extrae la información de cada una en un formato estructurado. Identifica el comercio, la fecha (YYYY-MM-DD), el total y una categoría general (ej: Comida, Transporte, Servicios, Ropa, Varios)."
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            date: { type: Type.STRING },
            total: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["merchant", "total", "category"],
        },
      },
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as ReceiptItem[];
  }
  return [];
};

export const generateInsights = async (receipts: ReceiptItem[]): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    Basado en estos datos de gastos:
    ${JSON.stringify(receipts)}

    Genera 3 insights o consejos financieros breves y útiles para el usuario.
    Usa formato Markdown. Sé amigable y directo.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "No se pudieron generar insights.";
};

export const chatWithAssistant = async (
  message: string, 
  contextData: ReceiptItem[], 
  history: {role: string, parts: {text: string}[]}[] 
): Promise<string> => {
  const ai = getAiClient();
  
  const systemInstruction = `Eres un asistente financiero personal amigable y experto.
  Tienes acceso a los datos de gastos del usuario: ${JSON.stringify(contextData)}.
  Responde preguntas sobre sus gastos, da consejos y ayuda con recordatorios.
  Sé conciso y útil.`;

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
    },
    history: history,
  });

  const result = await chat.sendMessage({ message });
  return result.text || "Lo siento, no entendí eso.";
};
