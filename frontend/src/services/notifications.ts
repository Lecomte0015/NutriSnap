import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface MealReminderTime {
  hour: number;
  minute: number;
  label: string;
}

export interface NotificationSettings {
  mealReminders: boolean;
  dailyMotivation: boolean;
  streakAlerts: boolean;
  weeklyReport: boolean;
  mealTimes: MealReminderTime[];
  motivationHour: number;
}

const DEFAULT_MEAL_TIMES: MealReminderTime[] = [
  { hour: 8, minute: 0, label: 'Petit-déjeuner' },
  { hour: 12, minute: 30, label: 'Déjeuner' },
  { hour: 19, minute: 0, label: 'Dîner' },
];

const DEFAULT_SETTINGS: NotificationSettings = {
  mealReminders: true,
  dailyMotivation: true,
  streakAlerts: true,
  weeklyReport: true,
  mealTimes: DEFAULT_MEAL_TIMES,
  motivationHour: 9,
};

const MOTIVATIONAL_MESSAGES = [
  'Nouvelle journée, nouvelles opportunités ! Tu peux le faire !',
  'Chaque repas compte. Fais de bons choix aujourd\'hui !',
  'Tu es sur la bonne voie ! Continue comme ça !',
  'Un petit pas chaque jour mène à de grands résultats !',
  'Ta santé est ta richesse. Prends-en soin !',
];

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<string | null> {
    if (!Device.isDevice) return null;
    if (Platform.OS === 'web') return null;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return null;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      this.expoPushToken = tokenData.data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Général',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2fa4a7',
        });
        await Notifications.setNotificationChannelAsync('meals', {
          name: 'Rappels de repas',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
        await Notifications.setNotificationChannelAsync('motivation', {
          name: 'Motivation quotidienne',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
        await Notifications.setNotificationChannelAsync('achievements', {
          name: 'Succès et badges',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 300, 200, 300],
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  async scheduleMealReminders(settings: NotificationSettings): Promise<void> {
    await this.cancelByType('meal_reminder');
    if (!settings.mealReminders) return;

    for (const meal of settings.mealTimes) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: meal.label,
          body: `C'est l'heure de ${meal.label.toLowerCase()} ! N'oublie pas de scanner ton repas 📸`,
          sound: true,
          data: { type: 'meal_reminder' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: meal.hour,
          minute: meal.minute,
        },
      });
    }
  }

  async scheduleDailyMotivation(settings: NotificationSettings): Promise<void> {
    await this.cancelByType('daily_motivation');
    if (!settings.dailyMotivation) return;

    const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Motivation du jour 💪',
        body: randomMessage,
        sound: true,
        data: { type: 'daily_motivation' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.motivationHour,
        minute: 0,
      },
    });
  }

  async scheduleWeeklyReport(settings: NotificationSettings): Promise<void> {
    await this.cancelByType('weekly_report');
    if (!settings.weeklyReport) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ton bilan de la semaine 📊',
        body: 'Découvre ton résumé nutritionnel de la semaine ! Comment as-tu mangé ?',
        sound: true,
        data: { type: 'daily_motivation' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Lundi
        hour: 9,
        minute: 0,
      },
    });
  }

  async scheduleStreakAlert(currentStreak: number): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.streakAlerts || currentStreak === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔥 Attention à ta série !',
        body: `Tu as une série de ${currentStreak} jours ! Ne la perds pas, scanne un repas maintenant.`,
        sound: true,
        data: { type: 'streak_alert' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 4,
      },
    });
  }

  async scheduleStreakDangerAlert(currentStreak: number): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.streakAlerts || currentStreak === 0) return;

    // Alert at 20:00 if no meal scanned today
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Série en danger !',
        body: `Il est 20h et tu n'as pas encore scanné de repas aujourd'hui. Sauve ta série de ${currentStreak} jours !`,
        sound: true,
        data: { type: 'streak_alert' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  }

  async notifyBadgeUnlocked(badgeName: string, badgeIcon: string): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${badgeIcon} Badge débloqué !`,
        body: `Félicitations ! Tu as obtenu le badge "${badgeName}" ! +50 XP`,
        sound: true,
        data: { type: 'achievement' },
      },
      trigger: null,
    });
  }

  async sendLocalNotification(title: string, body: string, data?: Record<string, any>): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, data },
      trigger: null,
    });
  }

  private async cancelByType(type: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === type) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      if (!stored) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        mealTimes: parsed.mealTimes || DEFAULT_MEAL_TIMES,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    await this.scheduleMealReminders(settings);
    await this.scheduleDailyMotivation(settings);
    await this.scheduleWeeklyReport(settings);
  }

  addNotificationReceivedListener(callback: (n: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(callback: (r: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
