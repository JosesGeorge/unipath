import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { StudentData } from "../types";

const API_KEY = process.env.GEMINI_API_KEY;

const mockGenerateAnalysis = (data: StudentData): string => {
  const name = data.studentProfile.split(',')[0] || "Student";
  const major = data.studentProfile.includes("Major") ? data.studentProfile.split("Major")[1].split(".")[0].trim() : "Undisclosed Major";

  return `
# Career Intelligence Report: ${name}

### 1) Executive Summary
${name} is currently demonstrating strong foundational abilities in ${major}, with a profile that suggests a significant aptitude for complex problem-solving and industry engagement. Based on academic trends and self-reported skills, they are well-positioned for a trajectory toward high-impact professional roles, provided specific skill gaps in advanced frameworks and networking are addressed.

### 2) Academic Snapshot
* **Current Standing:** High Priority for Industry Placement
* **Recent Performance:** Upward trend in core quantitative subjects.
* **Core Strengths:** ${data.academicData.slice(0, 100)}...
* **Engagement Level:** ${data.attendanceBehaviorData ? "Excellent" : "Baseline"}

### 3) Diagnostic Scores Table (0–100)
| Metric | Score | Benchmark | Status |
| :--- | :--- | :--- | :--- |
| Academic Excellence | 88 | 75 | **High** |
| Technical Skill Depth | 74 | 70 | **Satisfactory** |
| Industry Readiness | 62 | 65 | **Developing** |
| Research Engagement | 91 | 60 | **Exemplary** |
| Soft Skills / Leadership | 80 | 70 | **Strong** |

### 4) Bottlenecks & Root Causes
1. **Practical Experience Gap (Severity: High):** Limited exposure to large-scale production environments despite strong theoretical knowledge.
2. **Professional Network (Severity: Medium):** Minimal engagement with alumni or industry professionals in target sectors.
3. **Advanced Certification (Severity: Low):** Lack of vendor-specific credentials (e.g., AWS, Google Cloud) which are currently filtered for in entry-level screening.

### 5) Professional Career Ranking Table (Top 5)
| Rank | Path | Fit Score | Growth Outlook |
| :--- | :--- | :--- | :--- |
| 1 | Research & Development Specialist | 95% | Exponential |
| 2 | Solutions Architect | 88% | High |
| 3 | Strategic Technical Consultant | 82% | Steady |
| 4 | Product Systems Engineer | 78% | High |
| 5 | Quantitative Data Analyst | 75% | Moderate |

### 6) Best Path + Backup Path + Confidence
* **Best Path:** **Research & Development Specialist** - Aligns perfectly with high research engagement scores and academic excellence.
* **Backup Path:** **Solutions Architect** - Leverages strong technical foundation with a focus on practical implementation.
* **Confidence Score:** **92/100**

### 7) Skill Gap Roadmap
* **3 Months:** Intensive certification training in core technologies.
* **6 Months:** Secure high-impact summer internship/research assistantship.
* **12 Months:** Complete capstone project with industry sponsorship.

### 8) 30/60/90-Day Professional Plan
* **30 Days:** Update professional portfolio; reach out to 5 industry mentors.
* **60 Days:** Complete 2 advanced technical certifications.
* **90 Days:** Apply for 3 competitive internship programs.

### 9) 12-Week Execution Plan
* **Week 1-4:** Focus on core academic stabilization and GPA maintenance.
* **Week 5-8:** Targeted skill acquisition in missing technical stacks.
* **Week 9-12:** Networking blitz and professional profile optimization.

### 10) Risk & Intervention Engine
* **High Risk:** Potential burnout if research load is not balanced with practical rest.
* **Intervention:** Faculty-led workload review and time-management workshops.

### 11) KPI Dashboard
| KPI | Baseline | Target |
| :--- | :--- | :--- |
| Technical Skills | 74 | 85 |
| Profile Visibility | 30 | 75 |
| Industry Connections | 5 | 25 |

### 12) Undergraduate Brief
Stay focused on the intersection of your research and ${major}. Your ability to translate theoretical models into practical insights will be your greatest asset.

### 13) Career Services Brief
Support ${name} with mock interviews and resume optimization focused on research achievements. 

### 14) Faculty Mentor Checklist
* [ ] Review latest research findings
* [ ] Connect student with at least two industry partners
* [ ] Verify alignment between capstone project and career goals

---
*Note: This report was generated in Demo Mode using UniPath AI's heuristic engine because no Gemini API key was detected.*
  `;
};

export const generateAnalysis = async (data: StudentData): Promise<string> => {
  if (!API_KEY) {
    console.warn("Gemini API key is not configured. Falling back to mock analysis.");
    // Simulate a short delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));
    return mockGenerateAnalysis(data);
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
