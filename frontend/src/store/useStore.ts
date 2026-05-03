import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User, Profile, Meal, DailyStats, Streak, Subscription, MascotMood, GamificationData } from '../types';
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
  language: 'en' | 'fr' | 'de' | 'it';
  hapticsEnabled: boolean;
  soundsEnabled: boolean;

  // Gamification
  gamification: GamificationData;

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
  setLanguage: (language: 'en' | 'fr' | 'de' | 'it') => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundsEnabled: (enabled: boolean) => void;
  setLoading: (loading: boolean) => void;
  setGamification: (data: GamificationData) => void;
  addXp: (amount: number) => void;
  clearNewBadge: () => void;
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
  hapticsEnabled: true,
  soundsEnabled: true,
  gamification: {
    totalXp: 0,
    mealsScanned: 0,
    averageScore: 0,
    unlockedBadgeIds: [],
    newlyUnlockedBadgeId: null,
  } as GamificationData,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
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

      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),

      setLoading: (isLoading) => set({ isLoading }),

      setGamification: (data) => set({ gamification: data }),

      addXp: (amount) => set((state) => ({
        gamification: { ...state.gamification, totalXp: state.gamification.totalXp + amount },
      })),

      clearNewBadge: () => set((state) => ({
        gamification: { ...state.gamification, newlyUnlockedBadgeId: null },
      })),

      reset: () => {
        // Clear Supabase session from web localStorage
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          Object.keys(window.localStorage)
            .filter((k) => k.startsWith('sb-'))
            .forEach((k) => window.localStorage.removeItem(k));
        }
        set(initialState);
      },
    }),
    {
      name: 'nutrisnap-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // Persiste uniquement les préférences utilisateur, pas les données serveur
      partialize: (state) => ({
        language: state.language,
        hapticsEnabled: state.hapticsEnabled,
        soundsEnabled: state.soundsEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        // Restaure i18n.locale depuis la langue sauvegardée
        if (state?.language) {
          i18n.locale = state.language;
        }
      },
    }
  )
);

export default useStore;
