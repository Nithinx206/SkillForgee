import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Task, GeminiTaskResponse, GeminiPlanResponse } from "../types";

// Helper to clean JSON string if Markdown blocks are present
function cleanJsonString(text: string): string {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return clean;
}

const API_KEY = process.env.API_KEY || '';
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Schema for extracting tasks
const taskResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['Work', 'Study', 'Personal', 'Health', 'Finance', 'Other'] },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          deadline: { type: Type.STRING, description: "ISO date string or null if none" },
          estimatedMinutes: { type: Type.INTEGER }
        },
        required: ['title', 'category', 'priority', 'estimatedMinutes']
      }
    }
  }
};

// Schema for planning
const planResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    focusOfTheDay: { type: Type.STRING },
    schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Time string e.g., 09:00 AM" },
          activity: { type: Type.STRING },
          taskId: { type: Type.STRING, description: "The exact title of the task if applicable, or null" },
          durationMinutes: { type: Type.INTEGER }
        },
        required: ['time', 'activity', 'durationMinutes']
      }
    }
  }
};

export const analyzeInput = async (
  text: string | null,
  imageBase64: string | null,
  audioBase64: string | null
): Promise<GeminiTaskResponse> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      });
      parts.push({ text: "Extract all actionable tasks, events, and reminders from this image." });
    }

    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: "audio/wav", // Assuming WAV from recorder
          data: audioBase64
        }
      });
      parts.push({ text: "Listen to this audio and extract all tasks, reminders, and notes." });
    }

    if (text) {
      parts.push({ text: `Analyze this request: "${text}"` });
    }

    parts.push({ text: "Return a JSON object with a list of tasks. Infer category, priority, deadline, and estimated duration if not specified." });

    // Use Flash for fast multimodal extraction
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: taskResponseSchema
      }
    });

    const jsonStr = cleanJsonString(response.text || "{}");
    return JSON.parse(jsonStr) as GeminiTaskResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze input.");
  }
};

export const generateSmartPlan = async (tasks: Task[]): Promise<GeminiPlanResponse> => {
  try {
    const activeTasks = tasks.filter(t => !t.completed);
    const tasksJson = JSON.stringify(activeTasks.map(t => ({
      title: t.title,
      priority: t.priority,
      category: t.category,
      estimatedMinutes: t.estimatedMinutes,
      deadline: t.deadline
    })));

    const prompt = `
      You are an expert productivity planner.
      Here is my list of active tasks:
      ${tasksJson}

      Please create a realistic, optimized daily schedule for today.
      - Start the day at 9:00 AM.
      - Include breaks.
      - Prioritize High priority tasks.
      - Group similar categories if efficient.
      - Suggest a "Focus of the Day".
    `;

    // Use Gemini 3 Pro Preview for complex reasoning/planning
    const response = await genAI.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planResponseSchema,
        thinkingConfig: { thinkingBudget: 2048 } // Allow some thinking for optimal planning
      }
    });

    const jsonStr = cleanJsonString(response.text || "{}");
    return JSON.parse(jsonStr) as GeminiPlanResponse;

  } catch (error) {
    console.error("Gemini Planning Error:", error);
    throw new Error("Failed to generate plan.");
  }
};
