import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily or safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

function getAIClient(): GoogleGenAI {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please set it in the Secrets panel.");
  }
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Helper to query Gemini safely with a fallback and retry mechanism
async function generateResponse(prompt: string, systemInstruction?: string): Promise<string> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  const maxRetries = 3;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const client = getAIClient();
        const response = await client.models.generateContent({
          model: model,
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });
        return response.text || "";
      } catch (error: any) {
        const errorStr = String(error?.message || error);
        const isRateLimitOrOverload = 
          error?.status === 503 || 
          error?.statusCode === 503 || 
          error?.status === 429 || 
          error?.statusCode === 429 || 
          errorStr.includes("503") || 
          errorStr.includes("429") || 
          errorStr.includes("resource exhausted") || 
          errorStr.includes("high demand") || 
          errorStr.includes("UNAVAILABLE");

        if (isRateLimitOrOverload && (attempt < maxRetries || model !== modelsToTry[modelsToTry.length - 1])) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`Gemini model ${model} overloaded or rate-limited (attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        console.warn(`Gemini API call on model ${model} failed (attempt ${attempt}/${maxRetries}):`, error);
        break; // Try the next model in modelsToTry
      }
    }
  }

  throw new Error("Failed to generate AI response from Gemini after trying multiple models and retrying.");
}

// 1. Deadline Failure Predictor & Panic Meter Endpoint
app.post("/api/ai/predict-failure", async (req, res) => {
  const { title, description, deadline, estimatedHours, importanceLevel, currentDateTime } = req.body;

  if (!title || !deadline || !estimatedHours) {
    return res.status(400).json({ error: "Missing required task fields." });
  }

  const prompt = `
  Analyze the risk of missing this deadline:
  Task Title: ${title}
  Description: ${description || "No description provided"}
  Deadline: ${deadline}
  Estimated Hours required to complete: ${estimatedHours}
  Importance: ${importanceLevel}
  Current Date & Time: ${currentDateTime}

  Please provide:
  1. Failure Probability (0 to 100 percentage)
  2. Risk Level (low, moderate, high, critical)
  3. Precise list of risk factors/reasons
  4. A Panic Meter Score (0 to 100) reflecting the stress/anxiety level of this specific commitment based on its proximity, importance, and work size.

  Return ONLY a valid JSON object matching this schema:
  {
    "failureProbability": number,
    "riskLevel": "low" | "moderate" | "high" | "critical",
    "reasons": string[],
    "panicScore": number
  }
  `;

  try {
    const rawResult = await generateResponse(
      prompt,
      "You are a hyper-intelligent, predictive project manager. Output raw valid JSON strictly matching the requested structure. Do not wrap in markdown blocks like ```json."
    );
    // Clean up any markdown wrapping just in case
    const cleaned = rawResult.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (error: any) {
    console.error("Failure prediction API error:", error);
    // Graceful fallback for demo if API fails/is not configured
    const mockProbability = Math.min(100, Math.max(10, Math.floor(estimatedHours * 12)));
    res.json({
      failureProbability: mockProbability,
      riskLevel: mockProbability > 75 ? "critical" : mockProbability > 50 ? "high" : mockProbability > 25 ? "moderate" : "low",
      reasons: [
        "Demanding timeline relative to estimated hours.",
        "High complexity or priority requires intense immediate focus.",
        "Procrastination threshold is elevated for high-importance tasks."
      ],
      panicScore: Math.min(100, Math.floor(mockProbability * 1.1))
    });
  }
});

// 2. Rescue Mode Endpoint (Emergency completion plan)
app.post("/api/ai/rescue-plan", async (req, res) => {
  const { title, description, deadline, estimatedHours, importanceLevel, currentDateTime } = req.body;

  const prompt = `
  Create an EMERGENCY RESCUE COMPLETION PLAN for this high-risk task:
  Task: ${title}
  Description: ${description || "No description"}
  Deadline: ${deadline}
  Estimated Hours: ${estimatedHours}
  Importance: ${importanceLevel}
  Current Date & Time: ${currentDateTime}

  Generate an aggressive, actionable, hour-by-hour or phased emergency plan to rescue this task from failure. Be supportive but highly focused. Include specific sub-tasks, time-boxing recommendations, and distraction-elimination tactics.

  Return the plan in markdown format.
  `;

  try {
    const plan = await generateResponse(
      prompt,
      "You are the Crisis Coordinator of the Rescue Center. Your tone is urgent, clear, tactical, and incredibly helpful. Guide the user step-by-step."
    );
    res.json({ plan });
  } catch (error: any) {
    res.json({
      plan: `### 🚨 Emergency Rescue Plan: ${title}\n\n1. **Stop all distractions (30-min setup)**: Turn off notifications, block social media, and find a quiet zone.\n2. **Break it down (Phase 1)**: Focus on building a minimal viable deliverable first.\n3. **Timebox (Intervals of 50m work / 10m rest)**: Complete at least 3 high-intensity sessions today.\n4. **Accept rough drafts**: Perfectionism is the enemy of survival. Get it done first, refine if time permits.`
    });
  }
});

// 3. Consequence Engine Endpoint
app.post("/api/ai/consequences", async (req, res) => {
  const { title, description, importanceLevel } = req.body;

  const prompt = `
  Simulate and predict the direct and indirect consequences if the user IGNORES or FAILS this commitment:
  Task: ${title}
  Description: ${description || "No description"}
  Importance: ${importanceLevel}

  Provide a realistic, blunt, yet motivating look at what happens. Cover:
  1. Immediate repercussions (academic/professional/social)
  2. Long-term reputation damage
  3. Internal stress and emotional toll

  Return the consequence simulation in markdown format.
  `;

  try {
    const consequences = await generateResponse(
      prompt,
      "You are the Consequence Engine. You tell the absolute, unvarnished truth about failure to motivate the user into action. Be direct, clear, and realistic."
    );
    res.json({ consequences });
  } catch (error: any) {
    res.json({
      consequences: `### ⚠️ Immediate and Deferred Consequences\n\n* **Immediate Impact**: Missing "${title}" will trigger immediate loss of trust and respect from stakeholders.\n* **Mental Strain**: The weight of an uncompleted, delayed task will hover over you, damaging your sleep and confidence.\n* **Compounding Repercussions**: Future work will be delayed, creating a cascading backlog that causes persistent stress.`
    });
  }
});

// 4. Future You Simulator Endpoint
app.post("/api/ai/future-you", async (req, res) => {
  const { title, description } = req.body;

  const prompt = `
  Generate two highly descriptive simulations of the future for this task: "${title}".
  
  Scenario A: "Successful Future You" (The positive outcome of taking action right now and completing the task).
  Scenario B: "Ignored Future You" (The stressful, regretful, and exhausting outcome of procrastinating and letting the deadline slip).

  Return ONLY a valid JSON object matching this schema:
  {
    "futureCompleted": string (describing Scenario A in vivid, sensory, motivating detail),
    "futureIgnored": string (describing Scenario B in realistic, anxiety-inducing but constructive detail)
  }
  `;

  try {
    const rawResult = await generateResponse(
      prompt,
      "You are a time-traveling coach showing the user two branching paths of reality. Output raw valid JSON strictly. Do not wrap in markdown blocks."
    );
    const cleaned = rawResult.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (error: any) {
    res.json({
      futureCompleted: "You wake up feeling light and energized. The shadow of the deadline is entirely gone. You receive praises for your dedication, and you can enjoy your leisure time with zero guilt.",
      futureIgnored: "You are staring at your screen late at night, your eyes bloodshot, frantically typing out excuses. Your stomach is knotted with stress, and you are forced to deal with an emergency that could have easily been avoided."
    });
  }
});

// 5. Accountability Coach Endpoint
app.post("/api/ai/coach", async (req, res) => {
  const { coachPersona, tasks } = req.body;

  const taskSummary = (tasks || []).map((t: any) => 
    `- [${t.status.toUpperCase()}] ${t.title} (Deadline: ${t.deadline}, Priority: ${t.importanceLevel}, Hours: ${t.estimatedHours})`
  ).join("\n");

  const prompt = `
  Analyze the user's workload and provide custom coaching advice.
  User Selected Persona: ${coachPersona || "analytical"}
  
  User's Current Commitments:
  ${taskSummary || "No tasks recorded yet."}

  Provide custom personalized advice, identifying high-risk areas, pattern of commitments, and direct coaching feedback.
  `;

  const systemInstructions: Record<string, string> = {
    gentle: "You are a warm, nurturing, and empathetic coach. You speak with deep kindness, understanding the struggles of executive dysfunction, and offer gentle steps to get started without shame.",
    "drill-sergeant": "You are an intense, highly-demanding, high-energy accountability partner. You speak in direct, loud (metaphorical), no-excuses terms. You push the user to do the hard work now, but remain fundamentally on their side.",
    analytical: "You are a logical, database-driven productivity optimizer. You analyze tasks strictly through mathematical capacity, bottlenecks, probability metrics, and objective prioritization models.",
    stoic: "You are a calm, measured, and philosophical mentor. You draw from ancient Stoicism, advising the user that control over actions is the only true control, and focusing on immediate duty brings peace."
  };

  const sysInstruction = systemInstructions[coachPersona] || systemInstructions.analytical;

  try {
    const advice = await generateResponse(prompt, sysInstruction);
    res.json({ advice });
  } catch (error: any) {
    res.json({
      advice: `As your Coach, looking at your current task list of ${tasks?.length || 0} items, I recommend isolating your most critical commitment right now. Clear away smaller distractions and commit to a 25-minute sprint.`
    });
  }
});

// 6. Burnout Detector Endpoint
app.post("/api/ai/burnout", async (req, res) => {
  const { tasks } = req.body;

  const taskList = tasks || [];
  const totalHours = taskList.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0);
  const urgentTasks = taskList.filter((t: any) => t.status === "todo" && t.importanceLevel === "critical" || t.importanceLevel === "high").length;

  const prompt = `
  Analyze this student/professional's workload for Burnout:
  Total tasks: ${taskList.length}
  Total active estimated hours of effort required: ${totalHours} hours
  Critical or High priority active tasks: ${urgentTasks}

  Please determine:
  1. Burnout Risk Level (low, moderate, high, extreme)
  2. Burnout Advice: Practical work-rest boundary advice, workload prioritization, and physical/mental recovery tactics.

  Return ONLY a valid JSON object matching this schema:
  {
    "burnoutRisk": "low" | "moderate" | "high" | "extreme",
    "burnoutAdvice": string
  }
  `;

  try {
    const rawResult = await generateResponse(
      prompt,
      "You are a clinical occupational psychologist and workload consultant. Provide an accurate burnout assessment. Output raw valid JSON strictly."
    );
    const cleaned = rawResult.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.json(parsed);
  } catch (error: any) {
    let mockRisk = "low";
    if (totalHours > 40 || urgentTasks > 4) mockRisk = "extreme";
    else if (totalHours > 25 || urgentTasks > 2) mockRisk = "high";
    else if (totalHours > 10) mockRisk = "moderate";

    res.json({
      burnoutRisk: mockRisk,
      burnoutAdvice: "To prevent burnout under your current load, we highly recommend implementing strict work-rest boundaries. Limit high-focus study/work sessions to 4 hours maximum per day, insert 15-minute screen-free walks, and delegate or postpone tasks that do not have critical consequences."
    });
  }
});

// Express serving client app logic
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Deadline Guardian AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
