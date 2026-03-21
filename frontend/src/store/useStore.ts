import { create } from 'zustand';
import { User, Profile, Meal, DailyStats, Streak, Subscription, MascotMood } from '../types';
import i18n from '../i18n';

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Profile
  profile: Profile | null;
  onboardingCompleted: boolean;
  
  // Meals
  meals: Meal[];
  todayMeals: Meal[];
  
  // Stats
  dailyStats: DailyStats | null;
  streak: Streak | null;
  
  // Subscription
  subscription: Subscription | null;
  isPremium: boolean;
  analysisCountToday: number;
  
  // UI
  mascotMood: MascotMood;
  mascotMessage: string;
  language: 'fr' | 'de' | 'it';
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setMeals: (meals: Meal[]) => void;
  addMeal: (meal: Meal) => void;
  setTodayMeals: (meals: Meal[]) => void;
  setDailyStats: (stats: DailyStats | null) => void;
  setStreak: (streak: Streak | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setIsPremium: (isPremium: boolean) => void;
  incrementAnalysisCount: () => void;
  resetAnalysisCount: () => void;
  setMascotMood: (mood: MascotMood) => void;
  setMascotMessage: (message: string) => void;
  setLanguage: (language: 'fr' | 'de' | 'it') => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  profile: null,
  onboardingCompleted: false,
  meals: [],
  todayMeals: [],
  dailyStats: null,
  streak: null,
  subscription: null,
  isPremium: false,
  analysisCountToday: 0,
  mascotMood: 'idle' as MascotMood,
  mascotMessage: '',
  language: 'fr' as const,
};

export const useStore = create<AppState>((set) => ({
  ...initialState,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setProfile: (profile) => set({ profile }),
  
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  
  setMeals: (meals) => set({ meals }),
  
  addMeal: (meal) => set((state) => ({ 
    meals: [meal, ...state.meals],
    todayMeals: [meal, ...state.todayMeals]
  })),
  
  setTodayMeals: (todayMeals) => set({ todayMeals }),
  
  setDailyStats: (dailyStats) => set({ dailyStats }),
  
  setStreak: (streak) => set({ streak }),
  
  setSubscription: (subscription) => set({ 
    subscription,
    isPremium: subscription?.is_active && subscription?.plan !== 'free'
  }),
  
  setIsPremium: (isPremium) => set({ isPremium }),
  
  incrementAnalysisCount: () => set((state) => ({ 
    analysisCountToday: state.analysisCountToday + 1 
  })),
  
  resetAnalysisCount: () => set({ analysisCountToday: 0 }),
  
  setMascotMood: (mascotMood) => set({ mascotMood }),
  
  setMascotMessage: (mascotMessage) => set({ mascotMessage }),
  
  setLanguage: (language) => {
    i18n.locale = language;
    set({ language });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  reset: () => set(initialState),
}));

export default useStore;
