import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Task, UserProfile } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Page Components
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import DashboardPage from "./components/DashboardPage";
import TaskManagerPage from "./components/TaskManagerPage";
import RescueCenterPage from "./components/RescueCenterPage";
import AICoachPage from "./components/AICoachPage";
import AnalyticsPage from "./components/AnalyticsPage";
import DeploymentPage from "./components/DeploymentPage";

// Icons
import {
  Shield,
  LayoutDashboard,
  Calendar,
  Flame,
  Sparkles,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Activity,
  Loader2,
  CloudLightning,
} from "lucide-react";

export default function App() {
  // Navigation & User State
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Sidebar navigation control for mobile
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Dashboard rescue selection bypass
  const [selectedTaskToRescue, setSelectedTaskToRescue] = useState<Task | null>(null);

  // 1. Monitor Firebase Authentication state
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          
          // Setup real-time listener for the user's profile
          const profileRef = doc(db, "users", currentUser.uid);
          unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            } else {
              // Fallback if document doesn't exist yet
              setUserProfile({
                uid: currentUser.uid,
                email: currentUser.email || "",
                displayName: currentUser.displayName || "User",
                createdAt: new Date().toISOString(),
                coachPersona: "analytical",
              });
            }
          }, (err) => {
            console.error("Error listening to user profile (using fallback memory profile):", err);
            setUserProfile({
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "User",
              createdAt: new Date().toISOString(),
              coachPersona: "analytical",
            });
          });

          setCurrentPage("dashboard");
        } else {
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
          setUser(null);
          setUserProfile(null);
          setTasks([]);
          // Default back to landing if logged out
          setCurrentPage((curr) => (curr === "login" || curr === "signup" ? curr : "landing"));
        }
      } catch (err) {
        console.error("Error loading user profile during auth state transition:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // 2. Setup real-time listeners for the user's task subcollection
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const loadedTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          loadedTasks.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as Task);
        });
        // Sort by deadline chronological by default
        loadedTasks.sort((a, b) => {
          const timeA = a.deadline ? new Date(a.deadline).getTime() : 0;
          const timeB = b.deadline ? new Date(b.deadline).getTime() : 0;
          const validA = isNaN(timeA) ? 0 : timeA;
          const validB = isNaN(timeB) ? 0 : timeB;
          return validA - validB;
        });
        setTasks(loadedTasks);
      },
      (error) => {
        console.error("Firestore tasks subscription error:", error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. User Task actions synced with Firestore
  const handleCreateTask = async (taskData: Omit<Task, "id" | "userId" | "createdAt">) => {
    if (!user) return;
    try {
      const tasksRef = collection(db, "users", user.uid, "tasks");
      await addDoc(tasksRef, {
        userId: user.uid,
        ...taskData,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to write new task to Firestore, using local state fallback:", err);
      const localId = "local_" + Math.random().toString(36).substring(2, 9);
      setTasks((prev) => {
        const next = [
          ...prev,
          {
            id: localId,
            userId: user.uid,
            ...taskData,
            createdAt: new Date().toISOString(),
          } as Task,
        ];
        return next;
      });
    }
  };

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    try {
      const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);
      await updateDoc(taskDocRef, updates);
    } catch (err) {
      console.error("Failed to edit task in Firestore, using local state fallback:", err);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      const taskDocRef = doc(db, "users", user.uid, "tasks", taskId);
      await deleteDoc(taskDocRef);
    } catch (err) {
      console.error("Failed to delete task in Firestore, using local state fallback:", err);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Helper: call Failure Predictor server endpoint and save back to Firestore
  const handleAnalyzeTask = async (task: Task) => {
    if (!user) return;
    try {
      const res = await fetch("/api/ai/predict-failure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          estimatedHours: task.estimatedHours,
          importanceLevel: task.importanceLevel,
          currentDateTime: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (data.failureProbability !== undefined) {
        // Save predictions back to task doc
        const updates: Partial<Task> = {
          failureProbability: data.failureProbability,
          riskLevel: data.riskLevel,
          failureReasons: data.reasons,
          panicScore: data.panicScore,
          lastAnalyzedAt: new Date().toISOString(),
        };
        await handleEditTask(task.id, updates);
      }
    } catch (err) {
      console.error("Failed to analyze task with AI:", err);
      throw err;
    }
  };

  // User Profile actions
  const handleEditUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const profileRef = doc(db, "users", user.uid);
      await updateDoc(profileRef, updates);
      // Sync local profile state
      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (err) {
      console.error("Failed to update user profile:", err);
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage("landing");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Switch navigation page in active dashboard view
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileNavOpen(false);
  };

  const handleSelectTaskToRescue = (task: Task) => {
    setSelectedTaskToRescue(task);
    setCurrentPage("rescue");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <span className="text-sm font-semibold tracking-wide uppercase">Initiating Guardian Protocols...</span>
      </div>
    );
  }

  // Handle landing, login, and signup separate layouts
  if (currentPage === "landing") {
    return <LandingPage onNavigate={handleNavigate} />;
  }
  if (currentPage === "login") {
    return <LoginPage onNavigate={handleNavigate} onLoginSuccess={() => handleNavigate("dashboard")} />;
  }
  if (currentPage === "signup") {
    return <SignupPage onNavigate={handleNavigate} onSignupSuccess={() => handleNavigate("dashboard")} />;
  }

  // Navigation menu items
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", name: "Task Command", icon: Calendar },
    { id: "rescue", name: "Rescue Center", icon: Flame },
    { id: "coach", name: "AI Coach", icon: Sparkles },
    { id: "analytics", name: "System Analytics", icon: BarChart3 },
    { id: "deployment", name: "Git & Deploy", icon: CloudLightning },
  ];

  return (
    <div className="min-h-screen bg-[#030208] text-slate-100 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* 3D Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid-fine opacity-10 pointer-events-none" />

      {/* Background Mesh Gradients */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] mesh-glow-1 rounded-full blur-[120px] pointer-events-none opacity-30"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] mesh-glow-2 rounded-full blur-[120px] pointer-events-none opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-900/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-white/5 backdrop-blur-xl md:h-screen sticky top-0 flex flex-col z-40">
        
        {/* Header/Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-red-500 rounded-lg shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
              Guardian <span className="text-purple-400">AI</span>
            </span>
          </div>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 md:hidden text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            {isMobileNavOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Navigation links */}
        <nav
          className={`flex-1 p-4 space-y-1.5 ${
            isMobileNavOpen ? "block" : "hidden md:block"
          }`}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                id={`sidebar-link-${item.id}`}
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? "bg-white/10 text-white border border-white/10 shadow-lg shadow-black/20"
                    : "text-slate-400 hover:text-white border border-transparent hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-purple-400 block" : "text-slate-500"}`} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer profile summary */}
        <div className={`p-4 border-t border-white/10 shrink-0 ${isMobileNavOpen ? "block" : "hidden md:block"}`}>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{userProfile?.displayName || "User"}</span>
              <span className="text-[10px] text-slate-400 block truncate capitalize">{userProfile?.coachPersona || "analytical"} Coach</span>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-white/15 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer border-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main active workspace content with 3D/4D perspective viewport */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto md:h-screen bg-transparent relative z-10" style={{ perspective: "1200px" }}>
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.95, rotateY: 8, x: 40, z: -80 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0, z: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateY: -8, x: -40, z: -80 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="origin-center"
            >
              {currentPage === "dashboard" && (
                <DashboardPage
                  tasks={tasks}
                  userProfile={userProfile}
                  onNavigate={handleNavigate}
                  onSelectTaskToRescue={handleSelectTaskToRescue}
                />
              )}
              {currentPage === "tasks" && (
                <TaskManagerPage
                  tasks={tasks}
                  onCreateTask={handleCreateTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onAnalyzeTask={handleAnalyzeTask}
                />
              )}
              {currentPage === "rescue" && (
                <RescueCenterPage
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  selectedTaskFromDashboard={selectedTaskToRescue}
                  onClearSelectedTask={() => setSelectedTaskToRescue(null)}
                />
              )}
              {currentPage === "coach" && (
                <AICoachPage
                  tasks={tasks}
                  userProfile={userProfile}
                  onEditUserProfile={handleEditUserProfile}
                />
              )}
              {currentPage === "analytics" && <AnalyticsPage tasks={tasks} />}
              {currentPage === "deployment" && <DeploymentPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
