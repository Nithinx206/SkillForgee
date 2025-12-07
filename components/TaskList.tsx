import React from 'react';
import { Task, Priority } from '../types';
import { ICONS } from '../constants';
import { Badge } from './ui/Badge';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onDeleteTask }) => {
  const getPriorityVariant = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH: return 'danger';
      case Priority.MEDIUM: return 'warning';
      case Priority.LOW: return 'success';
      default: return 'default';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        {ICONS.Tasks}
        <p className="mt-2 text-sm font-medium">No tasks yet</p>
        <p className="text-xs">Add a task, upload a photo, or use voice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div 
          key={task.id}
          className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${
            task.completed 
              ? 'bg-slate-50 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800' 
              : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-indigo-500/30'
          }`}
        >
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 flex-shrink-0 focus:outline-none"
          >
            {task.completed ? ICONS.Check : ICONS.Uncheck}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                {task.title}
              </h3>
              <div className="flex gap-2 flex-shrink-0">
                 {!task.completed && (
                    <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                 )}
              </div>
            </div>
            
            {task.description && (
              <p className={`text-sm mt-1 ${task.completed ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                {task.category}
              </span>
              {task.estimatedMinutes && (
                <span className="flex items-center gap-1">
                  {ICONS.Clock}
                  {task.estimatedMinutes}m
                </span>
              )}
              {task.deadline && (
                <span className="flex items-center gap-1 text-orange-400 dark:text-orange-500/80">
                  {ICONS.Calendar}
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <button 
             onClick={() => onDeleteTask(task.id)}
             className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity px-2 dark:text-slate-600 dark:hover:text-red-400"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};