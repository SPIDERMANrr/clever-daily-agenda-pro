
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  schedule: ScheduleItem[];
  history: ScheduleItem[][];
  lastEdited: string;
}

export interface ScheduleItem {
  start: string;
  end: string;
  task: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
}
