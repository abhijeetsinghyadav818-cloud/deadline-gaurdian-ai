import React from "react";
import { motion } from "motion/react";
import { Task, ImportanceLevel, RiskLevel } from "../types";
import { Shield, BarChart3, TrendingUp, PieChart, Activity, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface AnalyticsPageProps {
  tasks: Task[];
}

export default function AnalyticsPage({ tasks }: AnalyticsPageProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const activeTasks = tasks.filter((t) => t.status === "todo");

  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Total Estimated Effort hours of active tasks
  const activeEffortHours = activeTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
  const completedEffortHours = completedTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  // Distribution by Importance Level
  const getImportanceCount = (level: ImportanceLevel) => tasks.filter((t) => t.importanceLevel === level).length;
  const importanceLevels: ImportanceLevel[] = ["low", "medium", "high", "critical"];
  const importanceDistribution = importanceLevels.map((lvl) => ({
    name: lvl,
    count: getImportanceCount(lvl),
    percentage: totalTasks > 0 ? Math.round((getImportanceCount(lvl) / totalTasks) * 100) : 0,
    color: lvl === "critical" ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : lvl === "high" ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : lvl === "medium" ? "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]",
  }));

  // Distribution of Active Tasks by Failure Risk Level
  const getRiskCount = (level: RiskLevel) => activeTasks.filter((t) => t.riskLevel === level).length;
  const unanalyzedCount = activeTasks.filter((t) => t.riskLevel === undefined).length;
  const riskLevels: RiskLevel[] = ["low", "moderate", "high", "critical"];
  const riskDistribution = riskLevels.map((lvl) => ({
    name: lvl,
    count: getRiskCount(lvl),
    percentage: activeTasks.length > 0 ? Math.round((getRiskCount(lvl) / activeTasks.length) * 100) : 0,
    color: lvl === "critical" ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : lvl === "high" ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : lvl === "moderate" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
  }));

  // Workload forecast advice
  const getWorkloadAdvice = () => {
    if (activeEffortHours > 40) {
      return {
        text: "Extreme Load Detected. You have committed more than a full work cycle of focused effort. Run timeline rescues immediately.",
        level: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      };
    }
    if (activeEffortHours > 20) {
      return {
        text: "Elevated Load State. Keep secondary tasks locked. Safeguard active priorities to prevent degradation cascade.",
        level: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    }
    return {
      text: "Workload parameters normal. Pacing curves are optimal. Maintain steady execution coordinates.",
      level: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    };
  };

  const workloadAdvice = getWorkloadAdvice();

  // Animation setups
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
        <h1 className="text-3xl font-display font-extrabold text-white">System Analytics</h1>
        <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">
          QUANTITATIVE METRICS // DIAGNOSING EFFORT DISTRIBUTION PARAMETERS
        </p>
      </div>

      {totalTasks === 0 ? (
        <div className="p-16 rounded-3xl border border-white/5 bg-white/[0.01] text-center text-slate-500 font-mono text-xs uppercase tracking-wider">
          NO DATA LOGGED YET. CREATE COMMITMENTS IN TASK MANAGER TO GENERATE TELEMETRY.
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top High-level Stats bar */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10"
          >
            <motion.div 
              variants={itemVariants}
              className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl"
            >
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Total Commitments</span>
              <span className="text-2xl font-display font-black text-white mt-1.5 block">{totalTasks}</span>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl"
            >
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Delivered Objectives</span>
              <span className="text-2xl font-display font-black text-white mt-1.5 block">{completedTasks.length}</span>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl"
            >
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Pending Backlog</span>
              <span className="text-2xl font-display font-black text-white mt-1.5 block">{activeTasks.length}</span>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="glass-3d-card glass-3d-card-interactive p-5 rounded-2xl"
            >
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block">Delivery Efficiency</span>
              <span className="text-2xl font-display font-black text-white mt-1.5 block">{completionRate}%</span>
            </motion.div>
          </motion.div>

          {/* Workload Effort hours panel */}
          <div className="grid lg:grid-cols-3 gap-6 relative z-10">
            
            {/* Visual Progress bar charts */}
            <motion.div 
              variants={itemVariants}
              className="lg:col-span-2 p-7 rounded-[32px] glass-3d-card space-y-6"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-purple-400" />
                Workload Density Metrics (Hours of Effort)
              </h3>

              <div className="space-y-6">
                {/* Active backlog hours progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase">Outstanding Backlog Hours</span>
                    <span className="text-white font-black">{activeEffortHours} Hours</span>
                  </div>
                  <div className="h-3.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, (activeEffortHours / 60) * 100))}%` }}
                      transition={{ type: "spring", stiffness: 45, delay: 0.1 }}
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Calculated over {activeTasks.length} pending objectives</span>
                </div>

                {/* Completed delivery hours progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400 uppercase">Delivered Effort Hours</span>
                    <span className="text-white font-black">{completedEffortHours} Hours</span>
                  </div>
                  <div className="h-3.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, (completedEffortHours / 60) * 100))}%` }}
                      transition={{ type: "spring", stiffness: 45, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Saves and completion records</span>
                </div>
              </div>

              {/* Workload feedback block */}
              <div className={`p-4 rounded-xl border ${workloadAdvice.level} text-xs leading-relaxed`}>
                💡 <span className="font-bold">Workload Diagnostic</span>: {workloadAdvice.text}
              </div>
            </motion.div>

            {/* Side summary info stats */}
            <motion.div 
              variants={itemVariants}
              className="p-7 rounded-[32px] glass-3d-card space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                  Efficiency Summary
                </h3>
                <div className="space-y-3 font-mono">
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                    <span className="text-slate-400 uppercase text-[9px]">Backlog Volume</span>
                    <span className="text-white font-black">{activeTasks.length} NODES</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                    <span className="text-slate-400 uppercase text-[9px]">Total Hours Invested</span>
                    <span className="text-white font-black">{completedEffortHours + activeEffortHours} HOURS</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 uppercase text-[9px]">Delivered Successes</span>
                    <span className="text-emerald-400 font-black">{completedTasks.length} TASKS</span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-slate-500 border-t border-white/5 pt-4 leading-relaxed font-mono uppercase">
                🛡️ Guardian diagnostics extracts real-time telemetry from active timelines. Keep commitments modular for precise analytics.
              </div>
            </motion.div>

          </div>

          {/* Bottom Distribution grid charts */}
          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            
            {/* Importance level distribution chart */}
            <motion.div 
              variants={itemVariants}
              className="p-7 rounded-[32px] glass-3d-card space-y-5"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <PieChart className="w-4.5 h-4.5 text-purple-400" />
                Commitment Priority Spread
              </h3>
              <div className="space-y-4 pt-1">
                {importanceDistribution.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="capitalize text-slate-400 font-bold">{item.name} Priority</span>
                      <span className="text-slate-300 font-black">{item.count} tasks ({item.percentage}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ type: "spring", stiffness: 50, delay: 0.3 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Risk level distribution chart */}
            <motion.div 
              variants={itemVariants}
              className="p-7 rounded-[32px] glass-3d-card space-y-5"
            >
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-red-500 animate-pulse" />
                Outstanding Backlog Risk Map
              </h3>
              <div className="space-y-4 pt-1">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="capitalize text-slate-400 font-bold">{item.name} Risk</span>
                      <span className="text-slate-300 font-black">{item.count} tasks ({item.percentage}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ type: "spring", stiffness: 50, delay: 0.4 }}
                        className={`h-full ${item.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
                {unanalyzedCount > 0 && (
                  <div className="text-[10px] text-slate-500 italic pt-2 text-center font-mono uppercase tracking-wider">
                    ⚠️ {unanalyzedCount} pending tasks are unanalyzed. Process them in task matrix command for full telemetry.
                  </div>
                )}
              </div>
            </motion.div>

          </div>

        </div>
      )}
    </motion.div>
  );
}
