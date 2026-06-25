import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, ImportanceLevel, TaskStatus } from "../types";
import { Plus, Edit2, Trash2, CheckCircle, RefreshCw, Calendar, Clock, AlertTriangle, Sparkles, Filter, Check, X, Search } from "lucide-react";

interface TaskManagerPageProps {
  tasks: Task[];
  onCreateTask: (taskData: Omit<Task, "id" | "userId" | "createdAt">) => Promise<void>;
  onEditTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onAnalyzeTask: (task: Task) => Promise<void>;
}

export default function TaskManagerPage({
  tasks,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onAnalyzeTask,
}: TaskManagerPageProps) {
  // Local state for the inline/toggle task form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form values
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number>(2);
  const [importanceLevel, setImportanceLevel] = useState<ImportanceLevel>("medium");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [importanceFilter, setImportanceFilter] = useState<"all" | ImportanceLevel>("all");

  // Loading states for individual task actions (like AI analysis or complete toggle)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDeadline("");
    setEstimatedHours(2);
    setImportanceLevel("medium");
    setEditingTask(null);
    setIsFormOpen(false);
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return "No Deadline";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? "No Deadline" : d.toLocaleString();
    } catch {
      return "No Deadline";
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    // Convert deadline ISO format back to local datetime-local format
    try {
      const dateObj = new Date(task.deadline);
      const tzOffset = dateObj.getTimezoneOffset() * 60000; // in ms
      const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
      setDeadline(localISOTime);
    } catch {
      setDeadline("");
    }
    setEstimatedHours(task.estimatedHours);
    setImportanceLevel(task.importanceLevel);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || estimatedHours <= 0) return;

    setFormSubmitLoading(true);
    const taskData = {
      title,
      description,
      deadline: new Date(deadline).toISOString(),
      estimatedHours,
      importanceLevel,
      status: "todo" as TaskStatus,
    };

    try {
      if (editingTask) {
        await onEditTask(editingTask.id, taskData);
      } else {
        await onCreateTask(taskData);
      }
      resetForm();
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setActionLoadingId(task.id + "-complete");
    const newStatus: TaskStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await onEditTask(task.id, {
        status: newStatus,
        completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      console.error("Status toggle failed:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTriggerAI = async (task: Task) => {
    setActionLoadingId(task.id + "-ai");
    try {
      await onAnalyzeTask(task);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to scrub this commitment from the Guardian records?")) {
      await onDeleteTask(id);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesImportance = importanceFilter === "all" || t.importanceLevel === importanceFilter;
    return matchesSearch && matchesStatus && matchesImportance;
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white">Task Command Matrix</h1>
          <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest">
            OPERATIONAL LOG // DEPLOY SIMULATIONS TO SECURE MILESTONES
          </p>
        </div>
        {!isFormOpen && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            id="add-task-btn"
            onClick={() => setIsFormOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 border border-white/10"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Commitment
          </motion.button>
        )}
      </div>

      {/* Task Creation / Editing Drawer Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 100, damping: 18 }}
            className="p-8 rounded-3xl glass-3d-card relative shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
            
            <button
              id="close-form-btn"
              onClick={resetForm}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
              {editingTask ? "03 // RECONFIGURE_COMMITMENT_PARAMETERS" : "03 // ESTABLISH_NEW_COMMITMENT"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Left Column inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Task Title / Objective
                    </label>
                    <input
                      id="form-title"
                      type="text"
                      required
                      placeholder="e.g., Midterm Essay Draft"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none text-xs font-mono transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Detailed Description
                    </label>
                    <textarea
                      id="form-desc"
                      placeholder="Provide specific parameters, notes or source files..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-600 outline-none text-xs font-mono resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Right Column inputs */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Deadline Date & Time
                      </label>
                      <input
                        id="form-deadline"
                        type="datetime-local"
                        required
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full px-3 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 outline-none text-xs font-mono transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Estimated Hours (Effort)
                      </label>
                      <input
                        id="form-hours"
                        type="number"
                        required
                        min={1}
                        max={120}
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 outline-none text-xs font-mono transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Subjective Importance Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["low", "medium", "high", "critical"] as ImportanceLevel[]).map((level) => (
                        <button
                          id={`level-${level}`}
                          key={level}
                          type="button"
                          onClick={() => setImportanceLevel(level)}
                          className={`py-2 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                            importanceLevel === level
                              ? level === "critical"
                                ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-md glow-red"
                                : level === "high"
                                ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-md"
                                : level === "medium"
                                ? "bg-purple-500/20 border-purple-500 text-purple-400 shadow-md glow-purple"
                                : "bg-teal-500/20 border-teal-500 text-teal-400 shadow-md"
                              : "border-white/5 bg-black/40 text-slate-500 hover:border-white/10"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                <button
                  id="cancel-btn"
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-mono font-bold uppercase text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-btn"
                  type="submit"
                  disabled={formSubmitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-purple-500/20 cursor-pointer border border-white/10"
                >
                  {formSubmitLoading ? "Verifying..." : editingTask ? "Commit Configurations" : "Save Commitment"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Filters & Sorting Panel */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            id="task-search"
            type="text"
            placeholder="Search objectives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl text-slate-200 text-xs placeholder-slate-600 outline-none focus:border-purple-500 transition-all font-mono"
          />
        </div>

        {/* Action filters */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto text-[10px] font-mono">
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-500 px-2 uppercase font-bold">Status:</span>
            {(["all", "todo", "completed"] as const).map((st) => (
              <button
                id={`status-filter-${st}`}
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-white/10 text-white border border-white/10 shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
            <span className="text-[9px] text-slate-500 px-2 uppercase font-bold">Priority:</span>
            {(["all", "low", "medium", "high", "critical"] as const).map((imp) => (
              <button
                id={`priority-filter-${imp}`}
                key={imp}
                onClick={() => setImportanceFilter(imp)}
                className={`px-3 py-1 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  importanceFilter === imp
                    ? "bg-white/10 text-white border border-white/10 shadow-md"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {imp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List Grid with Staggered Entrances */}
      {filteredTasks.length === 0 ? (
        <div className="p-16 rounded-3xl border border-white/5 bg-white/[0.01] text-center text-slate-500 font-mono text-xs uppercase tracking-wider">
          NO MATCHING NODES IDENTIFIED IN THIS SECTOR
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isAILoading = actionLoadingId === task.id + "-ai";
            const isCompleteLoading = actionLoadingId === task.id + "-complete";

            // Importance badges color matching
            const importanceColors: Record<ImportanceLevel, string> = {
              critical: "text-rose-400 bg-rose-500/10 border-rose-500/20",
              high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
              medium: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
              low: "text-teal-400 bg-teal-500/10 border-teal-500/20",
            };

            // Risk Level badges color
            const riskColors = {
              critical: "text-rose-400 border-rose-500/30 bg-rose-950/20",
              high: "text-orange-400 border-orange-500/30 bg-orange-950/20",
              moderate: "text-amber-400 border-amber-500/30 bg-amber-950/20",
              low: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20",
            };

            return (
              <motion.div
                variants={cardVariants}
                key={task.id}
                className={`p-6 rounded-2xl border transition-all relative overflow-hidden group shadow-lg ${
                  isCompleted
                    ? "border-white/5 bg-white/[0.01] opacity-45 backdrop-blur-sm"
                    : "border-white/5 bg-gradient-to-r from-white/[0.03] to-white/[0.01] backdrop-blur-md hover:border-purple-500/25 hover:bg-white/[0.04]"
                }`}
              >
                {/* Real-depth double glow indicator border */}
                {!isCompleted && task.failureProbability && task.failureProbability > 60 && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 glow-red" />
                )}

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Checkbox button */}
                      <button
                        id={`complete-btn-${task.id}`}
                        onClick={() => handleToggleComplete(task)}
                        disabled={isCompleteLoading}
                        className={`p-1 rounded-full border transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-purple-600 border-purple-500 text-white shadow shadow-purple-500/30"
                            : "border-white/20 hover:border-purple-400 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <h3
                        className={`text-base font-display font-extrabold text-white transition-colors ${
                          isCompleted ? "line-through text-slate-500 font-medium" : "group-hover:text-purple-300"
                        }`}
                      >
                        {task.title}
                      </h3>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border tracking-wider ${importanceColors[task.importanceLevel]}`}>
                        {task.importanceLevel}
                      </span>

                      {task.riskLevel && !isCompleted && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border tracking-wider ${riskColors[task.riskLevel]}`}>
                          AI RISK: {task.riskLevel}
                        </span>
                      )}
                    </div>

                    <p className={`text-xs ${isCompleted ? "text-slate-600" : "text-slate-400"} line-clamp-2 leading-relaxed font-sans`}>
                      {task.description || "No description logged."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        Deadline: {formatDate(task.deadline)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        Required: {task.estimatedHours} Hours
                      </span>
                    </div>

                    {/* AI Predictor Results Display if analyzed and not completed */}
                    {!isCompleted && task.failureProbability !== undefined && (
                      <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase text-[9px]">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                            AI failure predictor telemetry
                          </span>
                          <span className={`text-[11px] font-bold ${task.failureProbability > 60 ? "text-rose-400 animate-pulse" : "text-slate-400"}`}>
                            PROBABILITY: {task.failureProbability}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/10">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              task.failureProbability > 75
                                ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                : task.failureProbability > 45
                                ? "bg-orange-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${task.failureProbability}%` }}
                          />
                        </div>
                        {task.failureReasons && task.failureReasons.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-white/5">
                            <span className="text-slate-500 text-[9px] font-mono font-bold uppercase block">Core Risk Factors:</span>
                            <ul className="list-disc pl-4 text-slate-400 text-[11px] space-y-1 font-sans">
                              {task.failureReasons.slice(0, 2).map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-3 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0 shrink-0">
                    {!isCompleted && (
                      <button
                        id={`analyze-ai-${task.id}`}
                        onClick={() => handleTriggerAI(task)}
                        disabled={isAILoading}
                        className="px-4 py-2 bg-purple-500/10 hover:bg-purple-600/30 hover:text-white border border-purple-500/15 text-purple-300 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {isAILoading ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                        )}
                        {task.failureProbability !== undefined ? "Recalculate AI" : "Predict Failure"}
                      </button>
                    )}

                    <div className="flex gap-2 ml-auto lg:ml-0">
                      <button
                        id={`edit-btn-${task.id}`}
                        onClick={() => handleOpenEdit(task)}
                        className="p-2.5 rounded-xl border border-white/5 bg-black/20 text-slate-400 hover:text-white hover:border-white/15 transition-all cursor-pointer shadow-md"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-btn-${task.id}`}
                        onClick={() => handleDelete(task.id)}
                        className="p-2.5 rounded-xl border border-white/5 bg-black/20 text-red-400/80 hover:text-red-400 hover:border-red-500/25 transition-all cursor-pointer shadow-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
