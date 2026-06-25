import React from "react";
import { motion } from "motion/react";
import { Shield, Sparkles, Brain, Flame, Target, ChevronRight, Activity, ArrowUpRight } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-[#030208] text-slate-100 overflow-hidden font-sans selection:bg-purple-500/30 selection:text-white">
      {/* 3D Blueprint & Vector Grids */}
      <div className="absolute inset-0 cyber-grid opacity-25 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid-fine opacity-20 pointer-events-none" />
      
      {/* Ambient Laser Scanline Sweep */}
      <div className="laser-scan opacity-40" />

      {/* Floating 3D Dimensional Orbs */}
      <motion.div 
        animate={{ 
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          scale: [1, 1.15, 1],
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] mesh-glow-1 rounded-full pointer-events-none filter blur-[80px]" 
      />
      <motion.div 
        animate={{ 
          y: [20, -20, 20],
          x: [15, -15, 15],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] mesh-glow-2 rounded-full pointer-events-none filter blur-[80px]" 
      />
      <motion.div 
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] mesh-glow-3 rounded-full pointer-events-none filter blur-[100px]" 
      />

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-10 max-w-7xl mx-auto px-6 py-4 flex justify-between items-center bg-black/40 backdrop-blur-2xl border border-white/5 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.8)] rounded-3xl mt-6 mx-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-purple-500 via-violet-600 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/20 ring-1 ring-white/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-display font-extrabold tracking-tight uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Deadline Guardian <span className="text-purple-400">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            id="nav-login-btn"
            onClick={() => onNavigate("login")}
            className="px-4 py-2 text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            id="nav-signup-btn"
            onClick={() => onNavigate("signup")}
            className="px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all shadow-lg shadow-purple-600/25 flex items-center gap-1.5 group cursor-pointer border border-white/10"
          >
            Get Started
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center perspective-container">
        {/* Holographic Protocol Indicator */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/40 border border-purple-500/25 text-purple-200 text-xs font-mono mb-8 backdrop-blur-md glow-purple shadow-inner"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          PREDICTIVE TIME GUARDIAN PROTOCOL ACTIVE
        </motion.div>

        {/* Display Heading */}
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tighter text-white mb-6 max-w-5xl mx-auto leading-[1.05]"
        >
          Stop Missing Deadlines.<br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Predict & Prevent Failure.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-sans"
        >
          Our predictive AI simulator maps failure probability, warns you of impending overloads, 
          and creates interactive, crisis-averting rescue pathways to secure your ambitions.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-24"
        >
          <button
            id="hero-start-btn"
            onClick={() => onNavigate("signup")}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold tracking-wider uppercase text-xs rounded-xl shadow-2xl shadow-purple-500/30 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/10"
          >
            Deploy AI Guardian
            <ArrowUpRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
          <button
            id="hero-demo-btn"
            onClick={() => onNavigate("login")}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold tracking-wider uppercase text-xs rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            Enter Sandbox Mode
          </button>
        </motion.div>

        {/* Next-Gen 3D Cards Grid */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, delay: 0.6 }}
          className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto"
        >
          {/* Card 1 */}
          <motion.div 
            whileHover={{ y: -8, rotateX: 2, rotateY: -1, scale: 1.02 }}
            className="glass-3d-card glass-3d-card-interactive p-8 rounded-3xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center mb-6 text-purple-400 shadow-lg shadow-purple-500/10">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-white mb-3">Predictive Failure Radar</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Dynamic system calculation mapping failure probability, risk scores, and exact completion time metrics.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-purple-400">
              <span>ALGORITHM: BAYESIAN RISK</span>
              <span>100% ONLINE</span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            whileHover={{ y: -8, rotateX: 2, rotateY: 1, scale: 1.02 }}
            className="glass-3d-card glass-3d-card-interactive p-8 rounded-3xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-6 text-red-400 shadow-lg shadow-red-500/10">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-white mb-3">Emergency Rescue Suite</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Instantly unlock priority schedules, consequence warning matrices, and proactive crisis preservation routines.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-red-400">
              <span>PROTOCOL: CRITICAL MITIGATION</span>
              <span>STANDBY</span>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            whileHover={{ y: -8, rotateX: -2, rotateY: 1, scale: 1.02 }}
            className="glass-3d-card glass-3d-card-interactive p-8 rounded-3xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center mb-6 text-blue-400 shadow-lg shadow-blue-500/10">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-white mb-3">Adaptive Accountability Coach</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Configure your virtual partner's persona. Get active burnout evaluations, diagnostics, and strict guidance.
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-blue-400">
              <span>AI COMPANION: DYNAMIC</span>
              <span>ENGAGED</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 4D-Inspired Interactive Dashboard Preview */}
        <motion.div 
          initial={{ scale: 0.95, y: 50, opacity: 0 }}
          whileInView={{ scale: 1, y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 55, damping: 15 }}
          className="mt-28 p-8 md:p-10 rounded-[36px] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-3xl text-left max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group"
        >
          {/* Internal ambient glowing mesh */}
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-4 uppercase tracking-widest">
              <Activity className="w-4 h-4 animate-pulse text-purple-400" />
              SYSTEM DIAGNOSTIC: READY
            </div>
            <h4 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-4">
              Defend Your Future Calendar
            </h4>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-8">
              Plot milestones, monitor your internal panic levels, and align workload hours. We analyze effort timelines to guarantee success before procrastination takes hold.
            </p>
            <button
              id="cta-dashboard-btn"
              onClick={() => onNavigate("signup")}
              className="px-6 py-3.5 bg-gradient-to-r from-white to-slate-200 text-slate-950 hover:from-slate-100 hover:to-white font-extrabold tracking-wider uppercase text-xs rounded-xl shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
            >
              Initialize Profile
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Interactive Holographic Card (Realistic 3D styling) */}
          <div className="w-full md:w-80 p-6 rounded-3xl bg-black/60 border border-white/10 flex flex-col gap-5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group-hover:border-purple-500/30 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-mono text-[10px] text-slate-500">Milestone Track </span>
              <span className="px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 font-mono text-[9px] uppercase tracking-wider">High Risk Alert</span>
            </div>
            
            <div>
              <span className="text-white font-display font-bold text-sm block mb-1">Interactive Research Thesis</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: TASK_MEMBER_910</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Progress Bar</span>
                <span>80% Overload</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                <div className="h-full w-4/5 bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 rounded-full" />
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <span className="text-[11px] font-mono text-slate-400">Failure Prob.</span>
              <span className="text-base font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">83.4%</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-3 font-sans">
              ⚠️ <span className="text-purple-300 font-bold">Guardian Protocol</span>: 12 estimated hours of effort remain with only 14 hours until deadline. High risk of timeline failure.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#020104]/80 py-8 text-center text-[10px] font-mono tracking-widest uppercase text-slate-500 backdrop-blur-2xl">
        <p>© 2026 Deadline Guardian AI. Keeping your ambitions safe from procrastination.</p>
      </footer>
    </div>
  );
}
