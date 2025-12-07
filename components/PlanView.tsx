import React from 'react';
import { DayPlan } from '../types';
import { ICONS } from '../constants';

interface PlanViewProps {
  plan: DayPlan | null;
  loading: boolean;
}

export const PlanView: React.FC<PlanViewProps> = ({ plan, loading }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-indigo-600 dark:text-indigo-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
        {ICONS.Loading}
        <p className="mt-4 font-medium animate-pulse">Constructing your optimal schedule...</p>
        <p className="text-sm text-slate-400 mt-2">Analyzing priorities & deadlines</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        {ICONS.Calendar}
        <p className="mt-2 font-medium">No plan generated yet</p>
        <p className="text-xs text-center max-w-[200px]">Add tasks and click "Generate Plan" to get a schedule powered by Gemini 3 Pro.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col">
      <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-white">
        <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1">
          {ICONS.Stats}
          <span>Focus of the Day</span>
        </div>
        <h2 className="text-xl font-bold">{plan.focusOfTheDay}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {plan.schedule.map((item, index) => (
          <div key={index} className="flex gap-4 relative">
            {/* Timeline Line */}
            {index !== plan.schedule.length - 1 && (
              <div className="absolute left-[2.4rem] top-8 bottom-[-1.5rem] w-px bg-slate-200 dark:bg-slate-800"></div>
            )}
            
            <div className="flex-shrink-0 w-16 text-right">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{item.time}</span>
            </div>
            
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/30"></div>
            </div>

            <div className="flex-1 pb-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                <h4 className="font-medium text-slate-800 dark:text-slate-200">{item.activity}</h4>
                {item.taskId && (
                   <div className="mt-1 inline-flex items-center text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                      Task Linked
                   </div>
                )}
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                  {ICONS.Clock}
                  <span>{item.durationMinutes} min</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};