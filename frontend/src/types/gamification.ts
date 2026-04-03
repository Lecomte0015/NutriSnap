// Types pour le système de gamification

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: 'scans' | 'streak' | 'calories_saved' | 'score_average' | 'meals_logged' | 'weight_lost';
    value: number;
  };
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badgeId?: string;
  completedAt?: string;
  progress: number;
  target: number;
}

export interface UserLevel {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  icon: string;
  color: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'meals' | 'score' | 'streak' | 'calories';
  target: number;
  progress: number;
  reward: number;
  startsAt: string;
  endsAt: string;
  isCompleted: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar?: string;
  streak: number;
  averageScore: number;
  isCurrentUser: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  weightLost?: number;
  duration: string;
}

export interface GamificationState {
  badges: Badge[];
  achievements: Achievement[];
  currentLevel: UserLevel;
  totalXp: number;
  weeklyChallenges: WeeklyChallenge[];
  leaderboard: LeaderboardEntry[];
}

// Définition des niveaux
export const USER_LEVELS: UserLevel[] = [
  { level: 1, name: 'Débutant', minXp: 0, maxXp: 100, icon: '🌱', color: '#8BC34A' },
  { level: 2, name: 'Apprenti', minXp: 100, maxXp: 300, icon: '🥗', color: '#4CAF50' },
  { level: 3, name: 'Confirmé', minXp: 300, maxXp: 600, icon: '💪', color: '#2196F3' },
  { level: 4, name: 'Expert', minXp: 600, maxXp: 1000, icon: '🏆', color: '#FF9800' },
  { level: 5, name: 'Maître Nutrition', minXp: 1000, maxXp: 2000, icon: '👑', color: '#9C27B0' },
  { level: 6, name: 'Légende', minXp: 2000, maxXp: 999999, icon: '⭐', color: '#FFD700' },
];

// Définition des badges
export const BADGES_CONFIG: Omit<Badge, 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_scan',
    name: 'Premier Pas',
    description: 'Scannez votre premier repas',
    icon: '📸',
    color: '#4CAF50',
    requirement: { type: 'scans', value: 1 },
  },
  {
    id: 'scan_10',
    name: 'Photographe Culinaire',
    description: 'Scannez 10 repas',
    icon: '🍽️',
    color: '#2196F3',
    requirement: { type: 'scans', value: 10 },
  },
  {
    id: 'scan_50',
    name: 'Expert Scanner',
    description: 'Scannez 50 repas',
    icon: '📷',
    color: '#9C27B0',
    requirement: { type: 'scans', value: 50 },
  },
  {
    id: 'streak_3',
    name: 'Sur la Bonne Voie',
    description: '3 jours consécutifs',
    icon: '🔥',
    color: '#FF5722',
    requirement: { type: 'streak', value: 3 },
  },
  {
    id: 'streak_7',
    name: 'Semaine Parfaite',
    description: '7 jours consécutifs',
    icon: '🌟',
    color: '#FF9800',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'streak_30',
    name: 'Mois Légendaire',
    description: '30 jours consécutifs',
    icon: '💎',
    color: '#E91E63',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'score_8',
    name: 'Mangeur Sain',
    description: 'Score moyen supérieur à 8',
    icon: '🥇',
    color: '#FFD700',
    requirement: { type: 'score_average', value: 8 },
  },
  {
    id: 'calories_1000',
    name: 'Économiseur',
    description: '1000 kcal économisées',
    icon: '💰',
    color: '#00BCD4',
    requirement: { type: 'calories_saved', value: 1000 },
  },
];

// Témoignages statiques (pour démo)
export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Marie L.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    text: 'NutriSnap a changé ma vie ! J\'ai perdu 8kg en 3 mois sans me priver. La mascotte me motive chaque jour !',
    weightLost: 8,
    duration: '3 mois',
  },
  {
    id: '2',
    name: 'Thomas D.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    text: 'Enfin une app qui comprend ce que je mange ! L\'analyse IA est bluffante de précision.',
    weightLost: 5,
    duration: '2 mois',
  },
  {
    id: '3',
    name: 'Sophie M.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    text: 'Le système de badges me pousse à faire attention à mon alimentation. Très ludique !',
    weightLost: 12,
    duration: '4 mois',
  },
  {
    id: '4',
    name: 'Lucas R.',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    rating: 5,
    text: 'Premium vaut vraiment le coup. Les suggestions de recettes sont géniales !',
    weightLost: 6,
    duration: '2 mois',
  },
];
