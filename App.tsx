import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { TaskList } from './components/TaskList';
import { PlanView } from './components/PlanView';
import { generateSmartPlan } from './services/geminiService';
import { Task, DayPlan, OrganizerState } from './types';
import { ICONS, SAMPLE_TASKS } from './constants';

export default function App() {
  const [state, setState] = useState<OrganizerState>({
    tasks: [],
    plan: null,
    loading: false,
    processingStep: null,
    error: null
  });

  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load sample tasks on first mount if empty
  useEffect(() => {
    setState(prev => ({ ...prev, tasks: SAMPLE_TASKS }));
  }, []);

  const handleTasksGenerated = (newTasks: Task[]) => {
    setState(prev => ({ ...prev, tasks: [...newTasks, ...prev.tasks] }));
  };

  const toggleTaskComplete = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const handleGeneratePlan = async () => {
    const activeTasks = state.tasks.filter(t => !t.completed);
    if (activeTasks.length === 0) {
      alert("No active tasks to plan! Add some tasks first.");
      return;
    }

    setState(prev => ({ ...prev, loading: true, processingStep: 'Analyzing tasks & priorities...' }));
    
    try {
      const planResponse = await generateSmartPlan(state.tasks);
      
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        processingStep: null,
        plan: {
          date: new Date().toISOString(),
          focusOfTheDay: planResponse.focusOfTheDay,
          schedule: planResponse.schedule
        }
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "Failed to generate plan. Please try again." 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-10 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <span className="font-bold">L</span>
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              LifeOrganizer AI
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold tracking-wide uppercase border border-indigo-100 dark:border-indigo-800">Beta</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="hidden sm:flex items-center gap-1">
              {ICONS.Dashboard}
              <span>{state.tasks.filter(t => !t.completed).length} Active</span>
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? ICONS.Sun : ICONS.Moon}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
            {ICONS.Alert}
            <span>{state.error}</span>
            <button onClick={() => setState(prev => ({...prev, error: null}))} className="ml-auto text-sm underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input & Task List */}
          <div className="lg:col-span-7 space-y-6">
            <section>
              <h2 className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">Quick Add</h2>
              <InputSection 
                onTasksGenerated={handleTasksGenerated} 
                setLoading={(loading, msg) => setState(prev => ({ ...prev, loading, processingStep: msg }))} 
              />
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">My Tasks</h2>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {state.tasks.filter(t => t.completed).length} completed
                </span>
              </div>
              <TaskList 
                tasks={state.tasks} 
                onToggleComplete={toggleTaskComplete}
                onDeleteTask={deleteTask}
              />
            </section>
          </div>

          {/* Right Column: Planner */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">Daily Plan</h2>
                <button
                  onClick={handleGeneratePlan}
                  disabled={state.loading}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {state.loading ? 'Generating...' : 'Regenerate Plan'}
                  {ICONS.Clock}
                </button>
              </div>

              <div className="h-[calc(100vh-12rem)]">
                <PlanView plan={state.plan} loading={state.loading && state.processingStep?.includes('priorities')} />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {state.loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center transition-colors duration-300">
            <div className="animate-spin text-indigo-600 dark:text-indigo-400 mb-4">{ICONS.Loading}</div>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 animate-pulse">{state.processingStep || 'Loading...'}</p>
        </div>
      )}
    </div>
  );
}