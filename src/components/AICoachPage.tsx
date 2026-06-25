import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, CoachPersona, BurnoutRiskLevel } from "../types";
import { Sparkles, Activity, ShieldAlert, Heart, Brain, RefreshCw, Loader2, Play, Flame, CheckCircle2 } from "lucide-react";

interface AICoachPageProps {
  tasks: Task[];
  userProfile: any;
  onEditUserProfile: (updates: Partial<any>) => Promise<void>;
}

export default function AICoachPage({ tasks, userProfile, onEditUserProfile }: AICoachPageProps) {
  const [coachResponse, setCoachResponse] = useState<string>("");
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [loadingBurnout, setLoadingBurnout] = useState(false);

  const personas = [
    {
      id: "gentle" as CoachPersona,
      name: "Gentle Guide",
      tagline: "Empathetic & Understanding",
      description: "Speaks with validation and deep empathy. Formulates low-stress, bite-sized tasks to melt blockages.",
      icon: Heart,
      color: "text-teal-400 border-teal-500/20 bg-teal-950/10",
      activeColor: "bg-teal-600 text-white shadow-teal-500/20 border-teal-400"
    },
    {
      id: "drill-sergeant" as CoachPersona,
      name: "Drill Sergeant",
      tagline: "No-Excuses Momentum",
      description: "Intense, raw energy. Demands immediate focused output, eliminating analysis paralysis with extreme urgency.",
      icon: ShieldAlert,
      color: "text-rose-400 border-rose-500/20 bg-rose-950/10",
      activeColor: "bg-rose-600 text-white shadow-rose-500/20 border-rose-400"
    },
    {
      id: "analytical" as CoachPersona,
      name: "Analytical Optimizer",
      tagline: "Logical & Database Driven",
      description: "Treats workflows mathematically. Suggests optimal priority sequencing and timebox metrics.",
      icon: Brain,
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-950/10",
      activeColor: "bg-indigo-600 text-white shadow-indigo-500/20 border-indigo-400"
    },
    {
      id: "stoic" as CoachPersona,
      name: "Stoic Philosopher",
      tagline: "Calm & Duty Focused",
      description: "Encourages quiet focus on immediate duty. Avoids mental clutter by prioritizing actions you control.",
      icon: Activity,
      color: "text-amber-400 border-amber-500/20 bg-amber-950/10",
      activeColor: "bg-amber-600 text-white shadow-amber-500/20 border-amber-400"
    }
  ];

  // Helper to switch Coach Persona dynamically
  const handleSwitchPersona = async (personaId: CoachPersona) => {
    if (userProfile?.coachPersona === personaId) return;
    try {
      await onEditUserProfile({ coachPersona: personaId });
      setCoachResponse(""); // Clear stale advice
    } catch (err) {
      console.error("Failed to update coach persona:", err);
    }
  };

  // Get Accountability advice from server
  const handleConsultCoach = async () => {
    setLoadingCoach(true);
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachPersona: userProfile?.coachPersona || "analytical",
          tasks: tasks,
        }),
      });
      const data = await res.json();
      if (data.advice) {
        setCoachResponse(data.advice);
      }
    } catch (err) {
      console.error("Failed to consult coach:", err);
      setCoachResponse("As your coach, I am currently offline. Please prioritize your top critical tasks immediately.");
    } finally {
      setLoadingCoach(false);
    }
  };

  // Run Burnout Detector from server
  const handleRunBurnoutDetector = async () => {
    setLoadingBurnout(true);
    try {
      const res = await fetch("/api/ai/burnout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks,
        }),
      });
      const data = await res.json();
      if (data.burnoutRisk && data.burnoutAdvice) {
        await onEditUserProfile({
          burnoutRisk: data.burnoutRisk as BurnoutRiskLevel,
          burnoutAdvice: data.burnoutAdvice,
        });
      }
    } catch (err) {
      console.error("Burnout detection failed:", err);
    } finally {
      setLoadingBurnout(false);
    }
  };

  const selectedCoach = personas.find((p) => p.id === userProfile?.coachPersona) || personas[2];

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 font-sans"
    >
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-white">AI Accountability Coach</h1>
        <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">
          COACH CALIBRATION // DIAGNOSE BACKLOG STRESS VECTOR COEFFICIENTS
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Columns: Coach Select & Consultation */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Persona selector */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              Choose Your Accountability Persona
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {personas.map((p) => {
                const IconComp = p.icon;
                const isSelected = userProfile?.coachPersona === p.id;
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    id={`coach-select-${p.id}`}
                    key={p.id}
                    onClick={() => handleSwitchPersona(p.id)}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex gap-4 relative overflow-hidden ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 shadow-lg glow-purple"
                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? p.activeColor : p.color} border h-fit`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
                        {p.name}
                        {isSelected && (
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/25">
                            ACTIVE
                          </span>
                        )}
                      </h4>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">{p.tagline}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-2 font-sans">
                        {p.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Consult block */}
          <motion.div 
            variants={itemVariants}
            className="p-7 rounded-[32px] glass-3d-card space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${selectedCoach.color}`}>
                  <selectedCoach.icon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">Consult Coach {selectedCoach.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">CRITICAL BACKLOG EVALUATOR STATE</p>
                </div>
              </div>
              <button
                id="consult-coach-btn"
                onClick={handleConsultCoach}
                disabled={loadingCoach}
                className="px-4.5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-white/10"
              >
                {loadingCoach ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Backlog...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Analyze Workload
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {loadingCoach ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-12 text-center rounded-2xl bg-black/40 border border-white/5 space-y-4 flex flex-col items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 font-mono uppercase tracking-wider animate-pulse">Establishing Secure Neural Uplink...</p>
                    <p className="text-[10px] text-slate-500 font-mono">CALIBRATING PERSONA RECONSTRUCTORS</p>
                  </div>
                </motion.div>
              ) : coachResponse ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4 font-sans"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex gap-1.5 items-center text-xs text-purple-300 font-mono font-bold uppercase">
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                      COACH ADVICE CHANNEL TRANSMISSION
                    </div>
                    {/* Animated Waveform Group */}
                    <div className="flex items-end gap-[3px] h-7 px-2">
                      <div className="w-[3px] bg-purple-400 rounded-full animate-wave-bar" style={{ animationDelay: "0s" }} />
                      <div className="w-[3px] bg-indigo-400 rounded-full animate-wave-bar" style={{ animationDelay: "0.15s" }} />
                      <div className="w-[3px] bg-pink-400 rounded-full animate-wave-bar" style={{ animationDelay: "0.3s" }} />
                      <div className="w-[3px] bg-purple-500 rounded-full animate-wave-bar" style={{ animationDelay: "0.45s" }} />
                      <div className="w-[3px] bg-indigo-500 rounded-full animate-wave-bar" style={{ animationDelay: "0.6s" }} />
                      <div className="w-[3px] bg-pink-500 rounded-full animate-wave-bar" style={{ animationDelay: "0.75s" }} />
                    </div>
                  </div>
                  <div className="space-y-3 leading-relaxed text-xs text-slate-300">
                    {/* Parse newline coaching paragraph responses elegantly */}
                    {coachResponse.split("\n").map((para, idx) => (
                      <p key={idx} className="last:mb-0">
                        {para}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs font-mono uppercase tracking-wider border border-dashed border-white/5 rounded-2xl">
                  CLICK "ANALYZE WORKLOAD" TO INITIATE COACH Backlog DIAGNOSIS
                </div>
              )}
            </AnimatePresence>
          </motion.div>

        </div>

        {/* Right Sidebar Column: Burnout Detector */}
        <div className="space-y-6">
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-[32px] glass-3d-card space-y-6"
          >
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              Fatigue Risk Engine
            </h2>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex justify-between items-center font-mono">
                <span className="text-[10px] text-slate-400 uppercase">Risk Level</span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 animate-pulse">
                  {userProfile?.burnoutRisk || "low"}
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      userProfile?.burnoutRisk === "extreme"
                        ? "100%"
                        : userProfile?.burnoutRisk === "high"
                        ? "75%"
                        : userProfile?.burnoutRisk === "moderate"
                        ? "50%"
                        : "25%"
                  }}
                  transition={{ type: "spring", stiffness: 55, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    userProfile?.burnoutRisk === "extreme"
                      ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                      : userProfile?.burnoutRisk === "high"
                      ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                      : userProfile?.burnoutRisk === "moderate"
                      ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                      : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-3 border-t border-white/5 font-sans">
                {userProfile?.burnoutAdvice || "Diagnosis offline. Consult the Burnout Engine below to verify workload safety."}
              </p>
            </div>

             <button
              id="burnout-trigger-btn"
              onClick={handleRunBurnoutDetector}
              disabled={loadingBurnout}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-white/10 shadow-lg shadow-red-600/20"
            >
              {loadingBurnout ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Diagnosing Workload Fatigue...
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 animate-pulse" />
                  Evaluate Burnout Risk
                </>
              )}
            </button>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}
