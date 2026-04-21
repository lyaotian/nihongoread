import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuiz(article: string): Promise<QuizData> {
  const prompt = `
    Analyze the following Japanese article and generate 5 high-difficulty multiple-choice reading comprehension questions in Japanese, strictly adhering to JLPT N1 standards.
    
    Difficulty Requirements:
    - Questions should focus on nuanced interpretation, logical structure, and the author's underlying intent/tone.
    - Use JLPT N1 level vocabulary and grammar in both the questions and options.
    - Options should be plausible and require deep comprehension to differentiate; avoid obviously incorrect answers.
    - Each question must have 4 options and exactly one correct answer.
    - Provide a detailed academic explanation (in Japanese) for the correct answer, referencing specific parts of the text.
    
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
      questions
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("練習問題の生成に失敗しました。");
  }
}
