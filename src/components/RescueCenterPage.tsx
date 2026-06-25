import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../types";
import { Shield, Flame, Activity, Sparkles, Compass, AlertOctagon, RefreshCw, Loader2, Play, ChevronRight, UserMinus } from "lucide-react";

interface RescueCenterPageProps {
  tasks: Task[];
  onEditTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  selectedTaskFromDashboard: Task | null;
  onClearSelectedTask: () => void;
}

export default function RescueCenterPage({
  tasks,
  onEditTask,
  selectedTaskFromDashboard,
  onClearSelectedTask,
}: RescueCenterPageProps) {
  // Find active/incomplete tasks
  const activeTasks = useMemo(() => tasks.filter((t) => t.status === "todo"), [tasks]);

  // Selected task state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // AI loading states
  const [loadingMode, setLoadingMode] = useState<"rescue" | "consequences" | "future" | null>(null);

  // Local active panels
  const [activeTab, setActiveTab] = useState<"rescue" | "consequences" | "future">("rescue");

  // Handle selected task from parent dashboard
  useEffect(() => {
    if (selectedTaskFromDashboard) {
      setSelectedTask(selectedTaskFromDashboard);
      onClearSelectedTask();
    } else if (!selectedTask && activeTasks.length > 0) {
      // Default to first active high-risk task or any active task
      const firstHighRisk = activeTasks.find((t) => (t.failureProbability && t.failureProbability > 50) || t.importanceLevel === "critical");
      setSelectedTask(firstHighRisk || activeTasks[0]);
    }
  }, [selectedTaskFromDashboard, activeTasks]);

  // Invoke Rescue Mode (Crisis completion plan)
  const handleTriggerRescuePlan = async () => {
    if (!selectedTask) return;
    setLoadingMode("rescue");
    try {
      const res = await fetch("/api/ai/rescue-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          deadline: selectedTask.deadline,
          estimatedHours: selectedTask.estimatedHours,
          importanceLevel: selectedTask.importanceLevel,
          currentDateTime: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.plan) {
        await onEditTask(selectedTask.id, { rescuePlan: data.plan });
        // Update local task reference
        setSelectedTask((prev) => (prev ? { ...prev, rescuePlan: data.plan } : null));
      }
    } catch (err) {
      console.error("Rescue plan execution failed:", err);
    } finally {
      setLoadingMode(null);
    }
  };

  // Invoke Consequence Engine
  const handleTriggerConsequences = async () => {
    if (!selectedTask) return;
    setLoadingMode("consequences");
    try {
      const res = await fetch("/api/ai/consequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          importanceLevel: selectedTask.importanceLevel,
        }),
      });
      const data = await res.json();
      if (data.consequences) {
        await onEditTask(selectedTask.id, { consequences: data.consequences });
        setSelectedTask((prev) => (prev ? { ...prev, consequences: data.consequences } : null));
      }
    } catch (err) {
      console.error("Consequences extraction failed:", err);
    } finally {
      setLoadingMode(null);
    }
  };

  // Invoke Future You Simulator
  const handleTriggerFutureSimulator = async () => {
    if (!selectedTask) return;
    setLoadingMode("future");
    try {
      const res = await fetch("/api/ai/future-you", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
        }),
      });
      const data = await res.json();
      if (data.futureCompleted && data.futureIgnored) {
        const updates = {
          futureCompleted: data.futureCompleted,
          futureIgnored: data.futureIgnored,
        };
        await onEditTask(selectedTask.id, updates);
        setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
      }
    } catch (err) {
      console.error("Future simulation failed:", err);
    } finally {
      setLoadingMode(null);
    }
  };

  // Custom light Markdown parser for elegant visual text layouts
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith("###")) {
        return <h4 key={i} className="text-xs font-mono font-bold text-white mt-4 mb-2 uppercase tracking-wider flex items-center gap-1.5">{trimmed.replace("###", "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={i} className="text-sm font-display font-extrabold text-indigo-300 mt-5 mb-2 uppercase tracking-tight">{trimmed.replace("##", "").trim()}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={i} className="text-base font-display font-extrabold text-white mt-6 mb-3 border-b border-white/5 pb-1 uppercase tracking-tight">{trimmed.replace("#", "").trim()}</h2>;
      }
      
      // Strong text extraction in line
      const processBold = (str: string) => {
        const parts = str.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, index) => {
          if (index % 2 === 1) {
            return <strong key={index} className="text-purple-300 font-extrabold">{part}</strong>;
          }
          return part;
        });
      };

      // Bullet items
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        return (
          <li key={i} className="ml-4 list-disc text-xs text-slate-300 mb-1.5 leading-relaxed">
            {processBold(trimmed.substring(1).trim())}
          </li>
        );
      }
      
      // Number list items
      if (/^\d+\./.test(trimmed)) {
        const indexDot = trimmed.indexOf(".");
        return (
          <li key={i} className="ml-4 list-decimal text-xs text-slate-300 mb-1.5 leading-relaxed font-sans">
            {processBold(trimmed.substring(indexDot + 1).trim())}
          </li>
        );
      }

      if (trimmed === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-xs text-slate-300 mb-2 leading-relaxed font-sans">{processBold(trimmed)}</p>;
    });
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "No Deadline";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "No Deadline" : d.toLocaleDateString();
    } catch {
      return "No Deadline";
    }
  };

  const getRemainingTimeBudget = (deadlineStr: string) => {
    if (!deadlineStr) return null;
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    if (diffMs < 0) return { expired: true, text: "TIMELINE EXPIRED", percentage: 0 };
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    // Assume 7 days is the max window for rescue visualization
    const percentage = Math.max(5, Math.min(100, Math.round((diffMs / (1000 * 60 * 60 * 24 * 7)) * 100)));
    
    let text = "";
    if (diffDays > 0) {
      text = `${diffDays}d ${diffHours}h remaining`;
    } else {
      text = `${diffHours}h remaining (URGENT)`;
    }
    
    return { expired: false, text, percentage };
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-white">Crisis Rescue Center</h1>
        <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">
          SIMULATOR CONTROL // MITIGATE DECAY CHANNELS BEFORE TIMELINE SINK
        </p>
      </div>

      {activeTasks.length === 0 ? (
        <div className="p-16 rounded-3xl border border-white/5 bg-white/[0.01] text-center text-slate-500 font-mono text-xs uppercase tracking-wider">
          NO ACTIVE ROADMAPS FOUND. INITIALIZE COMMITMENTS TO DEPLOY SYSTEMS.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Task Selector */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Active Timeline Roadmaps
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {activeTasks.map((t) => {
                const isSelected = selectedTask?.id === t.id;
                const isHighRisk = (t.failureProbability && t.failureProbability > 50) || t.importanceLevel === "critical";
                
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    id={`select-rescue-${t.id}`}
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`w-full p-4 text-left rounded-2xl border transition-all cursor-pointer backdrop-blur-sm relative overflow-hidden ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 text-white shadow-xl glow-purple"
                        : "border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/[0.04] hover:border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-display font-extrabold text-xs line-clamp-1">{t.title}</h3>
                      {isHighRisk && (
                        <span className="p-1 rounded bg-rose-500/15 border border-rose-500/25 text-rose-400 shrink-0">
                          <Flame className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-3.5">
                      <span>DUE // {formatDate(t.deadline)}</span>
                      {t.failureProbability && (
                        <span className="text-rose-400 font-bold">Risk: {t.failureProbability}%</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right/Middle Columns: Active Systems Display */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {selectedTask ? (
                <motion.div 
                  key={selectedTask.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="p-7 rounded-[32px] glass-3d-card space-y-6 border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />
                  
                  {/* Selected Task Summary */}
                  <div className="border-b border-white/5 pb-5">
                    <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-widest block mb-1">
                      TARGET NODE INTEGRATION
                    </span>
                    <h2 className="text-xl font-display font-black text-white">{selectedTask.title}</h2>
                    <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
                      {selectedTask.description || "No description logged."}
                    </p>
                    
                    {/* Interactive Time Budget Indicator */}
                    {getRemainingTimeBudget(selectedTask.deadline) && (
                      <div className="mt-4 p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 uppercase font-bold">Temporal Buffer</span>
                          <span className={`${getRemainingTimeBudget(selectedTask.deadline)?.expired ? 'text-red-400 animate-pulse' : 'text-blue-400'} font-bold`}>
                            {getRemainingTimeBudget(selectedTask.deadline)?.text}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${getRemainingTimeBudget(selectedTask.deadline)?.percentage}%` }}
                            transition={{ type: "spring", stiffness: 60, delay: 0.1 }}
                            className={`h-full rounded-full ${
                              getRemainingTimeBudget(selectedTask.deadline)?.expired
                                ? "bg-red-500"
                                : "bg-gradient-to-r from-blue-500 to-indigo-500"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* System Module Navigation tabs */}
                  <div className="flex border-b border-white/5 gap-2 overflow-x-auto pb-0.5">
                    <button
                      id="tab-rescue"
                      onClick={() => setActiveTab("rescue")}
                      className={`pb-3 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 px-3.5 ${
                        activeTab === "rescue"
                          ? "border-purple-500 text-purple-300"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                      1 // RESCUE_PROTOCOL
                    </button>
                    <button
                      id="tab-consequences"
                      onClick={() => setActiveTab("consequences")}
                      className={`pb-3 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 px-3.5 ${
                        activeTab === "consequences"
                          ? "border-rose-500 text-rose-300"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <AlertOctagon className="w-4 h-4" />
                      2 // CONSEQUENCE_ENGINE
                    </button>
                    <button
                      id="tab-future"
                      onClick={() => setActiveTab("future")}
                      className={`pb-3 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 px-3.5 ${
                        activeTab === "future"
                          ? "border-blue-500 text-blue-300"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      3 // FUTURE_SIMULATOR
                    </button>
                  </div>

                  {/* Tab content 1: Rescue Plan */}
                  {activeTab === "rescue" && (
                    <div className="space-y-4">
                      {selectedTask.rescuePlan ? (
                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] font-mono text-purple-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                              <Compass className="w-4 h-4 animate-spin-slow" /> Custom Emergency Rescue Roadmap
                            </span>
                            <button
                              id="regenerate-rescue"
                              onClick={handleTriggerRescuePlan}
                              disabled={loadingMode !== null}
                              className="text-[9px] font-mono font-bold uppercase text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" /> Re-synthesize
                            </button>
                          </div>
                          <div className="space-y-1 text-slate-300 leading-relaxed font-sans">
                            {renderMarkdown(selectedTask.rescuePlan)}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-4">
                          <Compass className="w-8 h-8 text-purple-400/80 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-wider">Rescue System Idle</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              Need an actionable schedule? Run our AI compiler to formulate an aggressive hour-by-hour roadmap.
                            </p>
                          </div>
                          <button
                            id="generate-rescue-btn"
                            onClick={handleTriggerRescuePlan}
                            disabled={loadingMode !== null}
                            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 mx-auto border border-white/10 shadow-lg shadow-purple-600/20"
                          >
                            {loadingMode === "rescue" ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Synthesizing coordinates...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Initialize Rescue Plan
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab content 2: Consequence Engine */}
                  {activeTab === "consequences" && (
                    <div className="space-y-4">
                      {selectedTask.consequences ? (
                        <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                              <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" /> Consequence Prediction Matrix
                            </span>
                            <button
                              id="regenerate-consequences"
                              onClick={handleTriggerConsequences}
                              disabled={loadingMode !== null}
                              className="text-[9px] font-mono font-bold uppercase text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" /> Re-evaluate
                            </button>
                          </div>
                          <div className="space-y-1 text-slate-300 leading-relaxed font-sans">
                            {renderMarkdown(selectedTask.consequences)}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-4">
                          <AlertOctagon className="w-8 h-8 text-rose-400/80 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-wider">Consequence Predictor Offline</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              Need a high-impact reality check? Predict the precise professional, social, and academic fallout of skipping this.
                            </p>
                          </div>
                          <button
                            id="generate-consequences-btn"
                            onClick={handleTriggerConsequences}
                            disabled={loadingMode !== null}
                            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 mx-auto border border-white/10 shadow-lg shadow-rose-600/20"
                          >
                            {loadingMode === "consequences" ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Analyzing outcomes...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Run Consequence Engine
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab content 3: Future You Simulator */}
                  {activeTab === "future" && (
                    <div className="space-y-4">
                      {selectedTask.futureCompleted && selectedTask.futureIgnored ? (
                        <div className="space-y-6 animate-fade-in">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] font-mono text-blue-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                              <Activity className="w-4 h-4 text-blue-500 animate-pulse" /> Dual Branch Timeline
                            </span>
                            <button
                              id="regenerate-future"
                              onClick={handleTriggerFutureSimulator}
                              disabled={loadingMode !== null}
                              className="text-[9px] font-mono font-bold uppercase text-slate-400 hover:text-white flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" /> Re-simulate
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Success Timeline */}
                            <motion.div 
                              whileHover={{ scale: 1.01 }}
                              className="p-5 rounded-2xl border border-emerald-500/10 bg-emerald-950/10 space-y-3 relative overflow-hidden backdrop-blur-sm"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                              <h4 className="text-emerald-400 font-display font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                🌟 Path Alpha: COMPLETED
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
                                "{selectedTask.futureCompleted}"
                              </p>
                            </motion.div>

                            {/* Failure Timeline */}
                            <motion.div 
                              whileHover={{ scale: 1.01 }}
                              className="p-5 rounded-2xl border border-rose-500/10 bg-rose-950/10 space-y-3 relative overflow-hidden backdrop-blur-sm"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
                              <h4 className="text-rose-400 font-display font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                ⚠️ Path Beta: IGNORED
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed italic font-sans">
                                "{selectedTask.futureIgnored}"
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-4">
                          <Activity className="w-8 h-8 text-blue-400/80 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-wider">Timeline Simulator Offline</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                              Compare parallel universes. Forecast your emotional states 24 hours from now for both completion and avoidance paths.
                            </p>
                          </div>
                          <button
                            id="generate-future-btn"
                            onClick={handleTriggerFutureSimulator}
                            disabled={loadingMode !== null}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 mx-auto border border-white/10 shadow-lg shadow-blue-600/20"
                          >
                            {loadingMode === "future" ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Compiling realities...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Deploy Future Simulator
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              ) : (
                <div className="p-16 text-center border border-white/5 rounded-[32px] bg-white/[0.01] font-mono text-xs text-slate-500 uppercase tracking-wider">
                  SELECT A TIMELINE NODE FROM THE LEFT COLUMN TO INITIATE PROTOCOLS
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </div>
  );
}
