import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, Question, JLPTLevel } from "../types";

let ai: GoogleGenAI | null = null;

// Initialize with environment variable or localStorage
const envKey = (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : undefined;
const storedKey = localStorage.getItem('GEMINI_API_KEY');

const initialKey = envKey || storedKey;
if (initialKey) {
  ai = new GoogleGenAI({ apiKey: initialKey });
}

export const hasApiKey = () => ai !== null;

export const setApiKey = (key: string) => {
  localStorage.setItem('GEMINI_API_KEY', key);
  ai = new GoogleGenAI({ apiKey: key });
};

export async function generateQuiz(article: string, level: JLPTLevel): Promise<QuizData> {
  if (!ai) {
    throw new Error("API_KEY_REQUIRED");
  }
  const prompt = `
    Analyze the following Japanese article and generate 5 multiple-choice reading comprehension questions in Japanese, strictly adhering to JLPT ${level} standards.
    
    Difficulty Requirements (JLPT ${level}):
    ${level === 'N1' ? `
    - Focus on nuanced interpretation, logical structure, and the author's underlying intent/tone.
    - Use N1 level vocabulary and complex grammar.
    - Options should be highly plausible and require deep comprehension to differentiate.
    ` : level === 'N2' ? `
    - Focus on main ideas, detailed facts, and logical relationships between sentences.
    - Use N2 level vocabulary and common formal grammar.
    - Options should be plausible and require clear understanding of the text.
    ` : `
    - Focus on basic comprehension, identifying facts, and simple inferences.
    - Use N3 level vocabulary and standard everyday grammar.
    - Options should be straightforward but require reading the relevant parts.
    `}
    - Each question must have 4 options and exactly one correct answer.
    - Provide a clear explanation (in Japanese) for the correct answer, referencing specific parts of the text.
    
    Article Context:
    ${article}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["questions"],
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "options", "correctAnswerIndex", "explanation"],
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    minItems: 4,
                    maxItems: 4
                  },
                  correctAnswerIndex: { 
                    type: Type.INTEGER,
                    description: "0-indexed index of the correct option"
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "Explanation of why the answer is correct and why other options might be wrong."
                  }
                }
              },
              minItems: 5,
              maxItems: 5
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Add unique IDs to questions
    const questions: Question[] = result.questions.map((q: any, index: number) => ({
      ...q,
      id: `q-${index}`
    }));

    return {
      article,
      questions,
      level,
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("練習問題の生成に失敗しました。");
  }
}
