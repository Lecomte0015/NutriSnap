import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  mealReminders: boolean;
  dailyMotivation: boolean;
  streakAlerts: boolean;
  weeklyReport: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  mealReminders: true,
  dailyMotivation: true,
  streakAlerts: true,
  weeklyReport: false,
};

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      this.expoPushToken = tokenData.data;
      console.log('Push token:', this.expoPushToken);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
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
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return null;
    }
  }

  async scheduleMealReminders(settings: NotificationSettings): Promise<void> {
    // Cancel existing meal reminders
    await this.cancelMealReminders();

    if (!settings.mealReminders) return;

    const mealTimes = [
      { hour: 8, minute: 0, title: 'Petit-dejeuner', body: 'N\'oublie pas de scanner ton petit-dejeuner !' },
      { hour: 12, minute: 30, title: 'Dejeuner', body: 'C\'est l\'heure du dejeuner ! Scanne ton repas.' },
      { hour: 19, minute: 0, title: 'Diner', body: 'Pret pour le diner ? Scanne ton repas !' },
    ];

    for (const meal of mealTimes) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: meal.title,
          body: meal.body,
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

    console.log('Meal reminders scheduled');
  }

  async scheduleDailyMotivation(settings: NotificationSettings): Promise<void> {
    await this.cancelDailyMotivation();

    if (!settings.dailyMotivation) return;

    const motivationalMessages = [
      'Nouvelle journee, nouvelles opportunites ! Tu peux le faire !',
      'Chaque repas compte. Fais de bons choix aujourd\'hui !',
      'Tu es sur la bonne voie ! Continue comme ca !',
      'Un petit pas chaque jour mene a de grands resultats !',
      'Ta sante est ta richesse. Prends-en soin !',
    ];

    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Motivation du jour',
        body: randomMessage,
        sound: true,
        data: { type: 'daily_motivation' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 9,
        minute: 0,
      },
    });

    console.log('Daily motivation scheduled');
  }

  async scheduleStreakAlert(currentStreak: number): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.streakAlerts) return;

    // Schedule for 8pm if user hasn't logged a meal
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Attention a ta serie !',
        body: `Tu as une serie de ${currentStreak} jours ! Ne la perds pas, scanne un repas maintenant.`,
        sound: true,
        data: { type: 'streak_alert' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 4, // 4 hours from now
      },
    });
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
      },
      trigger: null, // Immediate
    });
  }

  async cancelMealReminders(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'meal_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async cancelDailyMotivation(): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'daily_motivation') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem('notificationSettings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    // Update scheduled notifications
    await this.scheduleMealReminders(settings);
    await this.scheduleDailyMotivation(settings);
  }

  // Notification listeners
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
