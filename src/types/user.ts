export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: 'user' | 'admin' | 'school_admin';
  schoolId?: string;
  language: string;
  subscriptionPlan: 'free' | '2_week' | '1_month' | '3_month';
  subscriptionExpiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface UserDB {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  password_hash: string;
  role: string;
  school_id: string | null;
  language: string;
  subscription_plan: string;
  subscription_expires_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface School {
  id: string;
  name: string;
  contactPhone?: string;
  contactEmail?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  maxStudents: number;
  activeStudents: number;
  createdAt: number;
}

export interface Session {
  userId: string;
  role: string;
  expiresAt: number;
}
