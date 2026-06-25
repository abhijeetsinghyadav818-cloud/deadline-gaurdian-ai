import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Github, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  ExternalLink, 
  GitBranch, 
  GitCommit, 
  Database, 
  RefreshCw, 
  Flame, 
  ShieldCheck, 
  CloudLightning,
  ChevronRight,
  Info
} from "lucide-react";
import { activeConfig } from "../firebase";

export default function DeploymentPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [gitStatus, setGitStatus] = useState({
    branch: "main",
    uncommittedChanges: 0,
    lastCommitHash: "ae38bfd",
    lastCommitMsg: "feat: upgrade predictive time guardian engine with 4D perspective layout",
    lastCommitTime: "10 mins ago",
  });
  
  const [activeTab, setActiveTab] = useState<"github" | "firebase" | "cloudrun">("github");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const triggerMockSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setGitStatus(prev => ({
        ...prev,
        lastCommitHash: Math.random().toString(16).substring(2, 9),
        lastCommitMsg: "style: optimize multidimensional perspective sliders and realistic typography",
        lastCommitTime: "Just now"
      }));
    }, 2000);
  };

  const gitCommands = [
    {
      title: "1. Initialize local repository",
      cmd: "git init"
    },
    {
      title: "2. Add your GitHub remote repository",
      cmd: "git remote add origin https://github.com/YOUR_USERNAME/deadline-guardian-ai.git"
    },
    {
      title: "3. Commit your project files",
      cmd: "git add .\ngit commit -m \"feat: initialize deadline guardian with 4D animations & AI coach\""
    },
    {
      title: "4. Set main branch and push",
      cmd: "git branch -M main\ngit push -u origin main"
    }
  ];

  const deploymentSteps = [
    {
      title: "Configure Environment variables",
      desc: "Go to your project's Settings menu inside AI Studio, copy your secure Firebase API keys, and map them to your system workspace environment or your GitHub actions secrets."
    },
    {
      title: "GitHub Actions Automation",
      desc: "Our build system produces a fully-optimized client build in `dist/` and a robust compiled backend node server in `dist/server.cjs`. Push code to trigger your automatic pipeline."
    },
    {
      title: "Verify Live Production Url",
      desc: "Once deployed on Cloud Run, enjoy automatic routing, edge caching, global CDN acceleration, and automatic SSL certificates."
    }
  ];

  return (
    <div className="relative overflow-hidden min-h-[85vh] text-slate-100 font-sans pb-12">
      {/* Dynamic scanlines for terminal vibe */}
      <div className="laser-scan opacity-20 pointer-events-none" />

      {/* Page Title Header */}
      <div className="mb-10 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-2 uppercase tracking-widest">
            <CloudLightning className="w-4 h-4 text-purple-400 animate-pulse" />
            Core Deployment System
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Git & Cloud Run <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Control Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
            A secure gateway to integrate, synchronize, compile, and push your intelligent deadline-predictive system to GitHub and live production.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerMockSync}
          disabled={isSyncing}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 disabled:opacity-50"
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning Workspace...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync Repo Status
            </>
          )}
        </motion.button>
      </div>

      {/* Grid of details */}
      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Side: System Metrics & Active Config (4D Sliding feel) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Active Firebase Connection Status */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono text-purple-300 uppercase tracking-wider">Active Database</h3>
                <span className="text-sm font-display font-extrabold text-white">Firebase Config</span>
              </div>
            </div>

            <div className="space-y-4 font-mono text-[11px] text-slate-300 bg-black/40 border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-500">PROJECT_ID</span>
                <span className="text-purple-300 font-bold">{activeConfig.projectId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-500">DATABASE</span>
                <span className="text-indigo-300">ai-studio-default</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-slate-500">PROVIDER</span>
                <span className="text-emerald-400 font-bold">Email / Password</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">SECURITY_RULES</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Active
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-purple-950/20 border border-purple-500/15 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Database synchronization is handled via real-time subcollections. All credentials can be safely overridden in your environment setup.
              </p>
            </div>
          </motion.div>

          {/* Simulated 4D Server State Node */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-mono text-blue-300 uppercase tracking-wider">Holographic Server</h3>
                  <span className="text-sm font-display font-extrabold text-white">Active Node Engine</span>
                </div>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Server Compilation Load</span>
                  <span>9.2%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[9.2%] bg-blue-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>SSL Handshake Speed</span>
                  <span>14ms</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[14%] bg-purple-500 rounded-full" />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-between items-center font-mono text-[10px]">
                <span className="text-slate-500">Container Target Port</span>
                <span className="text-white bg-white/5 px-2 py-0.5 rounded">3000 (Ingress Secure)</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Side: Command Console & Tabbed sliding steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Selector for 4D Perspective Animation */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: "github", label: "Connect to GitHub", icon: Github },
              { id: "firebase", label: "Firebase Project Sync", icon: Database },
              { id: "cloudrun", label: "Production Deployment", icon: Cpu }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === tab.id 
                      ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white border border-purple-500/30 shadow-inner"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "github" && (
              <motion.div
                key="github"
                initial={{ opacity: 0, y: 30, rotateY: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -30, rotateY: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="space-y-6"
              >
                {/* Simulated Local Repository Control Card */}
                <div className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
                  <h3 className="text-base font-display font-extrabold text-white mb-4 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                    Local Workspace Git Status
                  </h3>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 bg-black/30 border border-white/5 rounded-2xl p-4 font-mono text-[11px] mb-6">
                    <div>
                      <span className="text-slate-500 block mb-1">Active Branch</span>
                      <span className="text-white font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        {gitStatus.branch}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Uncommitted</span>
                      <span className="text-amber-400 font-bold">{gitStatus.uncommittedChanges} files</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Last Commit</span>
                      <span className="text-purple-300 font-bold">[{gitStatus.lastCommitHash}]</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">Timestamp</span>
                      <span className="text-slate-400">{gitStatus.lastCommitTime}</span>
                    </div>
                  </div>

                  <div className="bg-purple-950/20 border border-purple-500/15 p-4 rounded-2xl flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-900/40 rounded-lg text-purple-400">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 block font-mono">CURRENT WORKSPACE REVISION</span>
                        <span className="text-xs text-slate-200 block truncate max-w-sm">{gitStatus.lastCommitMsg}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Git Instructions console */}
                <div className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-base font-display font-extrabold text-white flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-indigo-400" />
                      Link to GitHub Command Sequence
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">TERMINAL INSTRUCTIONS</span>
                  </div>

                  <div className="space-y-5">
                    {gitCommands.map((command, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-300 font-sans">{command.title}</h4>
                        <div className="flex items-center justify-between gap-4 bg-black/60 border border-white/10 rounded-xl p-3.5 font-mono text-xs text-indigo-300 relative group overflow-hidden">
                          <span className="whitespace-pre-line leading-relaxed">{command.cmd}</span>
                          <button
                            onClick={() => handleCopy(command.cmd, `git-${idx}`)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                          >
                            {copiedText === `git-${idx}` ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "firebase" && (
              <motion.div
                key="firebase"
                initial={{ opacity: 0, y: 30, rotateY: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -30, rotateY: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="space-y-6"
              >
                {/* Firebase Connection instructions card */}
                <div className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-amber-950/50 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-extrabold text-white">Override Your Firebase Project ID</h3>
                      <p className="text-xs text-slate-400 font-sans">Set your custom database ID to prevent "single-amulet-g2gpt" from appearing.</p>
                    </div>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4 font-sans text-xs text-slate-300">
                    <p className="leading-relaxed">
                      To associate this website entirely with your project <strong className="text-purple-300">deadline-guardian-ai</strong> (or any other custom project ID), simply declare these values in your workspace environment variables.
                    </p>

                    <p className="leading-relaxed">
                      By setting environment variables in the <strong className="text-white">Settings</strong> panel of your AI Studio browser UI, Vite will automatically inject them on rebuild.
                    </p>

                    <div className="space-y-3.5 pt-2">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2.5 font-mono text-[11px]">
                        <span className="text-slate-500">VITE_FIREBASE_PROJECT_ID</span>
                        <span className="text-purple-300 font-bold">deadline-guardian-ai</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2.5 font-mono text-[11px]">
                        <span className="text-slate-500">VITE_FIREBASE_FIRESTORE_DATABASE_ID</span>
                        <span className="text-indigo-300">ai-studio-964283d8-fba8-45d2-b3a1-af857b7e99a7</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Firestore Security Rules deployment check */}
                <div className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
                  <h3 className="text-base font-display font-extrabold text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Active Security Rule Configuration
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">
                    The secure Firestore database uses automated safety guidelines to allow authenticated users to view and write only their own records.
                  </p>

                  <div className="bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-48">
                    <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`}</pre>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "cloudrun" && (
              <motion.div
                key="cloudrun"
                initial={{ opacity: 0, y: 30, rotateY: 10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                exit={{ opacity: 0, y: -30, rotateY: -10 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="space-y-6"
              >
                <div className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-950/50 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Cpu className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-display font-extrabold text-white">Full-Stack Cloud Run Automation</h3>
                      <p className="text-xs text-slate-400 font-sans">Learn how this high-performance application handles production deployment.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {deploymentSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white mb-1">{step.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-3d-card p-6 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono block">LIVE EDGE ROUTING</span>
                    <h4 className="text-sm font-display font-bold text-white">Application URL Configuration</h4>
                    <p className="text-[11px] text-slate-400 max-w-md font-sans">
                      Our secure reverse proxy binds to container port <code className="text-blue-300 font-mono bg-white/5 px-1 py-0.5 rounded">3000</code>. All dev and live URLs are routed instantly.
                    </p>
                  </div>
                  <a
                    href="https://ai.studio/build"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    AI Studio console
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
