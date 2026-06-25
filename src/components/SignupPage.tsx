import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db, activeConfig } from "../firebase";
import { CoachPersona } from "../types";
import { Shield, Mail, Lock, User, AlertCircle, ArrowLeft, Loader2, Sparkles, Heart, Activity, Brain, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface SignupPageProps {
  onNavigate: (page: string) => void;
  onSignupSuccess: (user: any) => void;
}

export default function SignupPage({ onNavigate, onSignupSuccess }: SignupPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [coachPersona, setCoachPersona] = useState<CoachPersona>("analytical");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");

  const personas = [
    {
      id: "gentle" as CoachPersona,
      name: "Gentle Guide",
      description: "Understanding, calming, and validating. Ideal for heavy stress and anxiety triggers.",
      icon: Heart,
      color: "border-teal-500/20 text-teal-400 bg-teal-950/10 hover:border-teal-500/40"
    },
    {
      id: "drill-sergeant" as CoachPersona,
      name: "Drill Sergeant",
      description: "Aggressive, high-urgency tough love. No excuses allowed, extreme momentum.",
      icon: ShieldAlert,
      color: "border-rose-500/20 text-rose-400 bg-rose-950/10 hover:border-rose-500/40"
    },
    {
      id: "analytical" as CoachPersona,
      name: "Analytical Optimizer",
      description: "Mathematical, objective, and data-focused. Strict priority matrices & workload tracking.",
      icon: Brain,
      color: "border-indigo-500/20 text-indigo-400 bg-indigo-950/10 hover:border-indigo-500/40"
    },
    {
      id: "stoic" as CoachPersona,
      name: "Stoic Philosopher",
      description: "Calm, wisdom-focused. Teaches mindfulness of effort and letting go of results.",
      icon: Activity,
      color: "border-amber-500/20 text-amber-400 bg-amber-950/10 hover:border-amber-500/40"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Setup Firestore user profile doc
      const userProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || "User",
        createdAt: new Date().toISOString(),
        coachPersona: coachPersona,
        burnoutRisk: "low",
        burnoutAdvice: "System initialized. Workload normal."
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
      onSignupSuccess(user);
    } catch (err: any) {
      console.error("Signup failed:", err);
      let errMsg: React.ReactNode = "Unable to create account. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        try {
          console.log("Email already in use, attempting automatic sign-in fallback...");
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("Automatic sign-in successful!");
          onSignupSuccess(userCredential.user);
          return;
        } catch (loginErr: any) {
          console.error("Auto-login fallback failed:", loginErr);
          errMsg = (
            <div className="space-y-1">
              <p className="font-bold">Account Already Exists</p>
              <p className="text-[11px] text-slate-300">
                An account with the email <span className="text-purple-300 font-semibold">{email}</span> already exists.
              </p>
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="mt-1 text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Click here to sign in with this email &rarr;
              </button>
            </div>
          );
        }
      } else if (err.code === "auth/invalid-email") {
        errMsg = "The email address is invalid.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "The password is too weak. Choose 6+ characters.";
      } else if (err.code === "auth/operation-not-allowed") {
        errMsg = (
          <div className="space-y-2">
            <p className="font-bold">Email/Password Sign-In is Disabled</p>
            <p className="text-[11px] leading-relaxed">
              The Email/Password sign-in provider is currently disabled for this Firebase project. To enable it:
            </p>
            <ol className="list-decimal pl-4 text-[10px] space-y-1.5 leading-relaxed text-slate-300">
              <li>Open the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-purple-400 font-bold hover:text-purple-300">Firebase Console</a>.</li>
              <li>Select your project: <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-purple-300">{activeConfig.projectId}</code>.</li>
              <li>In the left sidebar, go to <strong>Authentication</strong>, then click the <strong>Sign-in method</strong> tab.</li>
              <li>Click <strong>Add new provider</strong> (or edit the existing <strong>Email/Password</strong> entry under Native providers).</li>
              <li>Toggle <strong>Enable</strong> to on, and click <strong>Save</strong>.</li>
            </ol>
          </div>
        );
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030208] text-slate-100 flex flex-col justify-center items-center px-6 py-12 font-sans overflow-y-auto">
      {/* 3D Blueprint & Vector Grids */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid-fine opacity-15 pointer-events-none" />

      {/* Atmospheric Glowing Orbs */}
      <motion.div 
        animate={{ 
          y: [-25, 25, -25],
          scale: [1, 1.15, 1]
        }}
        transition={{ 
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[10%] left-[5%] w-[500px] h-[500px] mesh-glow-1 rounded-full blur-[100px] pointer-events-none opacity-45" 
      />
      <motion.div 
        animate={{ 
          y: [25, -25, 25],
          scale: [1.1, 0.9, 1.1]
        }}
        transition={{ 
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] mesh-glow-2 rounded-full blur-[100px] pointer-events-none opacity-45" 
      />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        id="back-to-landing-btn"
        onClick={() => onNavigate("landing")}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-all cursor-pointer backdrop-blur-2xl bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 shadow-lg"
      >
        <ArrowLeft className="w-4 h-4 text-purple-400" />
        Back to Home
      </motion.button>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-3.5 bg-gradient-to-tr from-purple-500 via-indigo-600 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/20 mb-4 ring-1 ring-white/20"
          >
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </motion.div>
          <motion.h2 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-display font-extrabold text-white tracking-tight"
          >
            Deploy Your AI Guardian
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-mono"
          >
            Initiate automated timeline protection protocols
          </motion.p>
        </div>

        {/* Signup Container Card */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="p-8 md:p-10 rounded-3xl glass-3d-card shadow-2xl relative border border-white/10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex gap-3 items-start animate-fade-in">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column: Account info */}
              <div className="space-y-5">
                <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
                  01 // NODE ACCESS PARAMETERS
                </h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Operator Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0a0a10]/50 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none transition-all text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Communications Node (Email)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      id="signup-email"
                      type="email"
                      required
                      placeholder="jane@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0a0a10]/50 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none transition-all text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Security Keyphrase (Password)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      id="signup-password"
                      type="password"
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#0a0a10]/50 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none transition-all text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Coach Persona Select */}
              <div className="space-y-5">
                <h3 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <Activity className="w-4 h-4 text-purple-300 animate-pulse" />
                  02 // ACCOUNTABILITY DIRECTIVE
                </h3>

                <div className="grid grid-cols-1 gap-3 max-h-[310px] overflow-y-auto pr-1">
                  {personas.map((p) => {
                    const IconComponent = p.icon;
                    const isSelected = coachPersona === p.id;
                    return (
                      <button
                        id={`persona-${p.id}`}
                        key={p.id}
                        type="button"
                        onClick={() => setCoachPersona(p.id)}
                        className={`p-3.5 text-left rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 text-white shadow-lg glow-purple"
                            : "border-white/5 bg-[#07070d]/30 text-slate-400 hover:border-white/10 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex gap-3.5 items-start">
                          <div className={`p-2 rounded-xl border ${isSelected ? "bg-purple-600 border-purple-400 text-white" : "bg-[#050505]/40 border-white/5 text-slate-500"}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-display font-extrabold uppercase tracking-wider">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{p.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold tracking-wider uppercase text-xs rounded-xl shadow-2xl shadow-purple-600/30 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 border border-white/10 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Establishing Encrypted clearance...
                </>
              ) : (
                "Initialize AI Guardian System"
              )}
            </button>
          </form>

          {/* Prompt to login */}
          <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/5 pt-6 font-sans">
            Already registered?{" "}
            <button
              id="to-login-btn"
              onClick={() => onNavigate("login")}
              className="text-purple-400 font-bold hover:text-purple-300 transition-all cursor-pointer hover:underline"
            >
              Verify Existing Identity
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
