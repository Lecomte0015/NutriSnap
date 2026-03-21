export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id?: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  photo_base64?: string;
  age: number;
  weight: number;
  height: number;
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  daily_calories: number;
  language: 'fr' | 'de' | 'it';
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  image_base64?: string;
  image_url?: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  score: number;
  feedback: string;
  created_at: string;
}

export interface MealItem {
  id: string;
  meal_id: string;
  name: string;
  quantity: number;
  calories: number;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  total_calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals_count: number;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

export interface Subscription {
  user_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  plan: 'free' | 'monthly' | 'yearly';
  trial_end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  foods: string[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  score: number;
  feedback: string;
}

export type MascotMood = 'idle' | 'happy' | 'excited' | 'sad' | 'warning' | 'thinking';
