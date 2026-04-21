import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudentData } from "../types";

const API_KEY = process.env.GEMINI_API_KEY;

export const generateAnalysis = async (data: StudentData): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    You are an AI University Success and Career Intelligence Copilot for higher education institutions.
    
    Objective:
    Design a complete Undergraduate Progress Tracking and Professional Career Mapping System that is data-driven, professional, and industry-aligned.
    
    Analysis Workflow:
    1. Diagnose current status (strengths, weaknesses, learning gaps, root causes).
    2. Identify top 5 bottlenecks with severity.
    3. Forecast trajectory for 6 and 12 months.
    4. Rank top 5 career paths using interests, aptitude, academic trend, skill readiness, and market opportunity.
    5. Recommend: Best Path, Backup Path, and Confidence score.
    
    Structure your output strictly as follows:
    1) Executive Summary (max 120 words)
    2) Academic Snapshot
    3) Diagnostic Scores Table (0–100)
    4) Bottlenecks & Root Causes
    5) Professional Career Ranking Table (Top 5)
    6) Best Path + Backup Path + Confidence
    7) Skill Gap Roadmap (3/6/12 months)
    8) 30/60/90-Day Professional Plan
    9) 12-Week Execution Plan (Weekly Milestones)
    10) Risk & Intervention Engine
    11) KPI Dashboard (baseline vs target)
    12) Undergraduate Brief
    13) Career Services Brief
    14) Faculty Mentor Checklist
    
    Use evidence from the provided data only. Priority clarity and professional language.
  `;

  const userPrompt = `
    Analyze this undergraduate student's profile:
    - Profile: ${data.studentProfile}
    - Academics: ${data.academicData}
    - Engagement: ${data.attendanceBehaviorData}
    - Skills/Projects: ${data.skillsProjectsCertifications}
    - Interests: ${data.interestPsychometricData}
    - Preferences: ${data.constraintsAndPreferences}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text;
    if (!text) {
      console.error("Gemini AI returned empty response:", response);
      return "The AI was unable to generate a report. Please try again with more detailed information.";
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Invalid or missing API key. Please check your environment variables.");
    }
    throw error;
  }
};
