import { GoogleGenAI, Type } from "@google/genai";

export const generateAIShape = async (prompt: string, pointCount: number = 2000): Promise<Float32Array | null> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API Key found for Gemini");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      You are a 3D Geometry expert. 
      Generate a point cloud for the requested object.
      Return a JSON object with a single property 'points' which is a flat array of numbers.
      The array should represent [x1, y1, z1, x2, y2, z2, ...] for ${pointCount} points.
      Coordinates must be normalized roughly between -3 and 3.
      Output ONLY valid JSON.
    `;

    const modelPrompt = `Object to generate: ${prompt}. Create a recognizable 3D distribution of points.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: modelPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            points: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    if (data.points && Array.isArray(data.points)) {
      return new Float32Array(data.points);
    }

    return null;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return null;
  }
};
