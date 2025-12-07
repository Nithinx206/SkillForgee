import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  Loader2,
  Layout,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

export const ICONS = {
  Check: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  Uncheck: <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-500 transition-colors dark:text-slate-500 dark:hover:text-indigo-400" />,
  Clock: <Clock className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Mic: <Mic className="w-5 h-5" />,
  Image: <ImageIcon className="w-5 h-5" />,
  Send: <Send className="w-5 h-5" />,
  Loading: <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />,
  Dashboard: <Layout className="w-5 h-5" />,
  Tasks: <ListTodo className="w-5 h-5" />,
  Stats: <TrendingUp className="w-5 h-5" />,
  Alert: <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />,
  Sun: <Sun className="w-5 h-5" />,
  Moon: <Moon className="w-5 h-5" />
};

export const SAMPLE_TASKS = [
  {
    id: '1',
    title: 'Review quarterly budget',
    category: 'Finance',
    priority: 'High',
    completed: false,
    estimatedMinutes: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Grocery shopping',
    category: 'Personal',
    priority: 'Medium',
    completed: false,
    estimatedMinutes: 60,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Client meeting preparation',
    category: 'Work',
    priority: 'High',
    completed: true,
    estimatedMinutes: 30,
    createdAt: new Date().toISOString()
  }
];