import React from "react";
import { motion } from "motion/react";
import { Task } from "../types";
import { Shield, Play, AlertTriangle, Sparkles, Plus, CheckCircle, Calendar, Clock, Flame, ShieldAlert, ArrowRight } from "lucide-react";

interface DashboardPageProps {
  tasks: Task[];
  userProfile: any;
  onNavigate: (page: string) => void;
  onSelectTaskToRescue: (task: Task) => void;
}

export default function DashboardPage({ tasks, userProfile, onNavigate, onSelectTaskToRescue }: DashboardPageProps) {
  // Calculations
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((t) => t.status === "todo");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  
  // Due today calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const dueTodayCount = activeTasks.filter((t) => t.deadline && typeof t.deadline === "string" && t.deadline.startsWith(todayStr)).length;

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "No Deadline";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "No Deadline" : d.toLocaleDateString();
    } catch {
      return "No Deadline";
    }
  };

  // High Risk (AI predicts Failure Probability > 50% or Critical Importance)
  const highRiskTasks = activeTasks.filter(
    (t) => (t.failureProbability && t.failureProbability >= 50) || t.importanceLevel === "critical"
  );

  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Calculate Average Panic Score
  const activePanicTasks = activeTasks.filter((t) => t.panicScore !== undefined);
  const averagePanicScore =
    activePanicTasks.length > 0
      ? Math.round(activePanicTasks.reduce((sum, t) => sum + (t.panicScore || 0), 0) / activePanicTasks.length)
      : 0;

  // Panic meter feedback
  const getPanicFeedback = (score: number) => {
    if (score > 75) return { text: "CRITICAL PANIC ZONE", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (score > 45) return { text: "ELEVATED PRESSURE STATE", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    if (score > 15) return { text: "MANAGEABLE TIMELINE LOAD", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
    return { text: "ZEN STATE ACTIVE", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" };
  };

  const panicFeedback = getPanicFeedback(averagePanicScore);

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      className="space-y-8 relative"
    >
      {/* Top Welcome / System Status */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6 relative z-10"
      >
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
            Hello, <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">{userProfile?.displayName || "Operator"}</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 font-mono tracking-wider">
            GUARDIAN PROTOCOL ACTIVE // PERSONAL COACH: <span className="text-purple-400 uppercase font-bold">{userProfile?.coachPersona || "Stoic"}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="dash-add-task-btn"
            onClick={() => onNavigate("tasks")}
            className="px-4.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-600/25 cursor-pointer border border-white/10"
          >
            <Plus className="w-4 h-4" />
            New Commitment
          </button>
          <button
            id="dash-coach-btn"
            onClick={() => onNavigate("coach")}
            className="px-4.5 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Consult Coach
          </button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10"
      >
        {/* Stat 1 */}
        <motion.div 
          variants={itemVariants}
          className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Active Nodes</span>
            <span className="text-2xl font-display font-extrabold text-white">{activeTasks.length} <span className="text-xs text-slate-500 font-mono">/ {totalTasks}</span></span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-slate-400 shadow-inner">
            <Calendar className="w-4.5 h-4.5 text-purple-400" />
          </div>
        </motion.div>

        {/* Stat 2 */}
        <motion.div 
          variants={itemVariants}
          className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Due Cycle (Today)</span>
            <span className="text-2xl font-display font-extrabold text-white">{dueTodayCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-slate-400 shadow-inner">
            <Clock className="w-4.5 h-4.5 text-amber-400" />
          </div>
        </motion.div>

        {/* Stat 3 */}
        <motion.div 
          variants={itemVariants}
          className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Alert Threshold</span>
            <span className={`text-2xl font-display font-extrabold ${highRiskTasks.length > 0 ? "text-red-400" : "text-white"}`}>
              {highRiskTasks.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-slate-400 shadow-inner">
            <Flame className="w-4.5 h-4.5 text-red-400" />
          </div>
        </motion.div>

        {/* Stat 4 */}
        <motion.div 
          variants={itemVariants}
          className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Efficiency Rate</span>
            <span className="text-2xl font-display font-extrabold text-white">{completionRate}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 text-slate-400 shadow-inner">
            <CheckCircle className="w-4.5 h-4.5 text-blue-400" />
          </div>
        </motion.div>
      </motion.div>

      {/* Main Workspace Layout (Two columns) */}
      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left/Middle Column (Tasks & Panic Meter) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Panic Meter Gauge */}
          <motion.div 
            variants={itemVariants}
            className="p-7 rounded-[32px] glass-3d-card relative overflow-hidden"
          >
            {/* Top accent shine */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30" />
            
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2 mb-6">
              <Shield className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              Aggregate Panic Meter Gauge
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Radial Score Gauge with interactive spring scale */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative w-36 h-36 shrink-0 flex items-center justify-center bg-black/40 rounded-full border border-white/5 shadow-2xl relative"
              >
                {/* Visual back-glow */}
                <div className="absolute inset-4 rounded-full bg-purple-500/5 filter blur-md pointer-events-none" />
                
                <svg className="w-full h-full -rotate-90">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="60%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  {/* Outer futuristic tech ring */}
                  <circle
                    cx="72"
                    cy="72"
                    r="66"
                    className="stroke-white/[0.08] fill-none"
                    strokeWidth="1.5"
                    strokeDasharray="2 4"
                  />
                  {/* Empty track */}
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    className="stroke-white/[0.03] fill-none"
                    strokeWidth="8"
                  />
                  {/* Active glowing stroke */}
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="url(#gaugeGrad)"
                    className="fill-none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 364.42 }}
                    animate={{ strokeDashoffset: 364.42 - (364.42 * Math.min(100, Math.max(0, averagePanicScore))) / 100 }}
                    transition={{ type: "spring", stiffness: 45, damping: 11, delay: 0.2 }}
                    strokeDasharray={364.42}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-display font-black text-white tracking-tight drop-shadow-md">{averagePanicScore}</span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">PSI Rating</span>
                </div>
              </motion.div>

              {/* Score breakdown and status description */}
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="flex justify-center md:justify-start">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-mono font-bold border ${panicFeedback.color} tracking-wider uppercase`}>
                    {panicFeedback.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {averagePanicScore > 75
                    ? "Severe workload saturation. Multiple timelines are near decay. Urgent calibration is required via Rescue Mode to avoid complete workflow shutdown."
                    : averagePanicScore > 45
                    ? "Schedule pressures are high. Take manual control of priority buffers. Minimize secondary tasks immediately to safeguard primary deadlines."
                    : averagePanicScore > 15
                    ? "System bounds are normal. Procrastination risk is low. Maintain steady pacing coordinates to ensure flawless future delivery."
                    : "Pristine Zen State active. Procrastination vectors minimized. Excellent chronological trajectory."}
                </p>
                {averagePanicScore > 45 && (
                  <button
                    id="dash-rescue-panic-btn"
                    onClick={() => onNavigate("rescue")}
                    className="text-xs text-purple-400 font-bold hover:text-purple-300 flex items-center justify-center md:justify-start gap-1 mt-2 transition-all cursor-pointer hover:underline"
                  >
                    DEPLOY TIME RESCUE INTERFACE <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Critical Focus / Urgent Alerts */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                Immediate Action Protocols
              </h2>
              <button
                id="dash-view-tasks"
                onClick={() => onNavigate("tasks")}
                className="text-[10px] font-mono tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer uppercase hover:underline"
              >
                Open Task Command
              </button>
            </div>

            {highRiskTasks.length === 0 ? (
              <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm text-center text-slate-400 text-xs font-mono">
                NO CRITICAL TIMELINE DEVIATIONS DETECTED. HORIZON NOMINAL.
              </div>
            ) : (
              <div className="space-y-3">
                {highRiskTasks.slice(0, 3).map((task) => (
                  <motion.div
                    whileHover={{ scale: 1.01, x: 2 }}
                    key={task.id}
                    className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/25 transition-all flex justify-between items-center gap-4 group shadow-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-sm text-white group-hover:text-purple-300 transition-colors">
                          {task.title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/20 text-red-400 text-[8px] font-mono uppercase font-bold tracking-wider">
                          {task.importanceLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(task.deadline)}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500">{task.estimatedHours}h effort</span>
                        {task.failureProbability && (
                          <>
                            <span>•</span>
                            <span className="text-red-400 font-bold">Risk: {task.failureProbability}%</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      id={`rescue-task-${task.id}`}
                      onClick={() => onSelectTaskToRescue(task)}
                      className="p-2 px-3 rounded-xl bg-red-500/10 border border-red-500/15 hover:bg-gradient-to-r hover:from-purple-600 hover:to-red-600 hover:text-white text-red-200 transition-all flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Rescue
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar Column (Workload Burnout & Coach Advice) */}
        <div className="space-y-8">
          {/* Workload Burnout Risk Display */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-[32px] glass-3d-card space-y-4"
          >
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              Burnout Risk Predictor
            </h2>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
              <div className="flex justify-between items-center font-mono">
                <span className="text-[10px] text-slate-400 uppercase">Risk Level</span>
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 animate-pulse">
                  {userProfile?.burnoutRisk || "Low"}
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
                  transition={{ type: "spring", stiffness: 50, delay: 0.6 }}
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
                {userProfile?.burnoutAdvice || "Workload currently balanced. Your pacing limits are normal."}
              </p>
            </div>
          </motion.div>

          {/* Coach Quick Wisdom block */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-[32px] bg-gradient-to-b from-blue-500/10 to-indigo-500/5 border border-blue-500/20 backdrop-blur-md space-y-4 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              Coach Wisdom Channel
            </h2>
            <div className="italic text-xs text-slate-300 leading-relaxed bg-[#020204]/60 p-4 rounded-2xl border border-white/5 font-sans relative">
              "{userProfile?.coachPersona === "drill-sergeant"
                ? "Excuses build monuments of nothing. Select your highest priority, close your browser tabs, and do 10 minutes of concentrated output. Now!"
                : userProfile?.coachPersona === "gentle"
                ? "It is completely safe to start small. Just write the title or outline. You do not have to finish today, simply make a tiny point of contact."
                : userProfile?.coachPersona === "stoic"
                ? "Do not fear the mountain of work. You only live in the present moment. Control what is immediately in front of you."
                : "Mathematically, 80% of your progress comes from 20% of your effort. Identify that core block and optimize for it first."}"
            </div>
            <button
              id="dash-coach-wisdom-btn"
              onClick={() => onNavigate("coach")}
              className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-600/30 hover:text-white border border-blue-500/20 text-blue-300 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer shadow-md"
            >
              Consult Persona
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
