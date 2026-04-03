import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  textWhite: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  protein: string;
  carbs: string;
  fat: string;
  overlay: string;
  gradient: string[];
}

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  primary: '#009688',
  secondary: '#2fa4a7',
  background: '#eaf5f4',
  cardBackground: '#FFFFFF',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  border: '#E0E0E0',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  protein: '#FF6B6B',
  carbs: '#4ECDC4',
  fat: '#FFE66D',
  overlay: 'rgba(0,0,0,0.5)',
  gradient: ['#2fa4a7', '#009688'],
};

const darkColors: ThemeColors = {
  primary: '#00BFA5',
  secondary: '#4dd0e1',
  background: '#121212',
  cardBackground: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#707070',
  textWhite: '#FFFFFF',
  border: '#333333',
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFA726',
  protein: '#FF8A80',
  carbs: '#64FFDA',
  fat: '#FFE57F',
  overlay: 'rgba(0,0,0,0.7)',
  gradient: ['#4dd0e1', '#00BFA5'],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { lightColors, darkColors };
