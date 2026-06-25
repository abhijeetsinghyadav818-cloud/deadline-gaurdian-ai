import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, activeConfig } from "../firebase";
import { Shield, Mail, Lock, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
    } catch (err: any) {
      console.error("Login failed:", err);
      let errMsg: React.ReactNode = "Invalid email or password. Please try again.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        errMsg = "Incorrect email or password.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "No account exists with this email.";
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
    <div className="relative min-h-screen bg-[#030208] text-slate-100 flex flex-col justify-center items-center px-6 font-sans">
      {/* 3D Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid-fine opacity-15 pointer-events-none" />

      {/* Atmospheric Glowing Orbs */}
      <motion.div 
        animate={{ 
          y: [-20, 20, -20],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[10%] left-[10%] w-[400px] h-[400px] mesh-glow-1 rounded-full blur-[90px] pointer-events-none opacity-40" 
      />
      <motion.div 
        animate={{ 
          y: [20, -20, 20],
          scale: [1.1, 0.9, 1.1]
        }}
        transition={{ 
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] mesh-glow-2 rounded-full blur-[90px] pointer-events-none opacity-40" 
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

      <div className="w-full max-w-md relative z-10">
        {/* Logo and title */}
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="p-3.5 bg-gradient-to-tr from-purple-500 via-indigo-600 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/20 mb-4 ring-1 ring-white/20"
          >
            <Shield className="w-7 h-7 text-white animate-pulse" />
          </motion.div>
          <motion.h2 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-display font-extrabold text-white tracking-tight"
          >
            Secure Node Login
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-mono"
          >
            Sign in to access guardian simulation
          </motion.p>
        </div>

        {/* Card containing the form */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.1 }}
          className="p-8 rounded-3xl glass-3d-card shadow-2xl relative border border-white/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex gap-3 items-start animate-fade-in">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Access Identifier (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0a10]/50 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none transition-all text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Verification Key (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0a10]/50 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none transition-all text-xs font-mono"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold tracking-wider uppercase text-xs rounded-xl shadow-lg shadow-purple-600/25 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 border border-white/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Decrypting Vault Credentials...
                </>
              ) : (
                "Verify Secure Clearance"
              )}
            </button>
          </form>

          {/* Prompt to register */}
          <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/5 pt-6 font-sans">
            New to the Guardian network?{" "}
            <button
              id="to-signup-btn"
              onClick={() => onNavigate("signup")}
              className="text-purple-400 font-bold hover:text-purple-300 transition-all cursor-pointer hover:underline"
            >
              Establish Clearance
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
