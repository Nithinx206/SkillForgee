export enum TaskCategory {
  WORK = 'Work',
  STUDY = 'Study',
  PERSONAL = 'Personal',
  HEALTH = 'Health',
  FINANCE = 'Finance',
  OTHER = 'Other'
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  deadline?: string;
  estimatedMinutes?: number;
  completed: boolean;
  createdAt: string;
}

export interface DayPlan {
  date: string; // ISO Date
  schedule: ScheduleItem[];
  focusOfTheDay: string;
}

export interface ScheduleItem {
  time: string; // "09:00 AM"
  taskId?: string; // Link to a task
  activity: string; // Description of activity if not a task link
  durationMinutes: number;
}

export interface OrganizerState {
  tasks: Task[];
  plan: DayPlan | null;
  loading: boolean;
  processingStep: string | null; // e.g., "Analyzing image...", "Generating plan..."
  error: string | null;
}

// For Gemini Response Parsing
export interface GeminiTaskResponse {
  tasks: Array<{
    title: string;
    description: string;
    category: string;
    priority: string;
    deadline: string | null;
    estimatedMinutes: number;
  }>;
}

export interface GeminiPlanResponse {
  focusOfTheDay: string;
  schedule: Array<{
    time: string;
    activity: string;
    taskId: string | null; // Try to match existing task ID or title
    durationMinutes: number;
  }>;
}
