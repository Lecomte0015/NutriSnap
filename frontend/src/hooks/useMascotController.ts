import { useCallback, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';
import { MascotMood, Profile } from '../types';

interface MascotControllerReturn {
  triggerReaction: (score: number, profile?: Profile | null) => void;
  triggerCelebrating: (message?: string) => void;
  setMood: (mood: MascotMood) => void;
  setThinking: () => void;
  resetToIdle: () => void;
}

export const useMascotController = (): MascotControllerReturn => {
  const { setMascotMood, setMascotMessage, mascotMood, hapticsEnabled } = useStore();
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      if (reactionDelayRef.current) clearTimeout(reactionDelayRef.current);
    };
  }, []);

  const scheduleResetToIdle = useCallback((delay: number = 3000) => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => {
      setMascotMood('idle');
      setMascotMessage('');
    }, delay);
  }, [setMascotMood, setMascotMessage]);

  const triggerReaction = useCallback((score: number, profile?: Profile | null) => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

    const reactionDelay = 200 + Math.random() * 300;

    reactionDelayRef.current = setTimeout(() => {
      let newMood: MascotMood;
      let message: string;

      if (score > 9) {
        newMood = 'celebrating';
        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        message = getMascotMessage('celebrating', score, profile);
      } else if (score > 7) {
        newMood = 'excited';
        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        message = getMascotMessage('excited', score, profile);
      } else if (score > 4) {
        newMood = 'happy';
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        message = getMascotMessage('happy', score, profile);
      } else if (score > 2) {
        newMood = 'warning';
        if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        message = getMascotMessage('warning', score, profile);
      } else {
        newMood = 'sad';
        if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        message = getMascotMessage('sad', score, profile);
      }

      setMascotMood(newMood);
      setMascotMessage(message);
      scheduleResetToIdle(5000);
    }, reactionDelay);
  }, [setMascotMood, setMascotMessage, scheduleResetToIdle]);

  const triggerCelebrating = useCallback((message?: string) => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMascotMood('celebrating');
    setMascotMessage(message || 'Bravo ! Tu as débloqué un nouveau badge ! 🏆');
    scheduleResetToIdle(5000);
  }, [setMascotMood, setMascotMessage, scheduleResetToIdle]);

  const setMood = useCallback((mood: MascotMood) => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setMascotMood(mood);
    if (mood !== 'idle') scheduleResetToIdle(3000);
  }, [setMascotMood, scheduleResetToIdle]);

  const setThinking = useCallback(() => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    setMascotMood('thinking');
    setMascotMessage('Hmm, laisse-moi analyser ça...');
  }, [setMascotMood, setMascotMessage]);

  const resetToIdle = useCallback(() => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    if (reactionDelayRef.current) clearTimeout(reactionDelayRef.current);
    setMascotMood('idle');
    setMascotMessage('');
  }, [setMascotMood, setMascotMessage]);

  return { triggerReaction, triggerCelebrating, setMood, setThinking, resetToIdle };
};

function getGoalLabel(goal?: string): string {
  if (goal === 'lose_weight') return 'perte de poids';
  if (goal === 'gain_muscle') return 'prise de muscle';
  return 'équilibre';
}

function getMascotMessage(mood: string, score: number, profile?: Profile | null): string {
  const name = profile?.first_name ? ` ${profile.first_name}` : '';
  const goal = getGoalLabel(profile?.goal);

  const messages: Record<string, string[]> = {
    celebrating: [
      `Score parfait${name} ! ${score}/10 ! Tu es une légende de la nutrition ! 🏆✨`,
      `${score}/10 ! Incroyable${name} ! Ce repas est exactement parfait pour ton objectif ${goal} ! 🌟`,
      `WOW${name} ! ${score}/10 ! Continue comme ça, tu es inarrêtable ! 💎`,
    ],
    excited: [
      `Super score${name} ! ${score}/10 ! Tu gères parfaitement ton objectif ${goal} ! 🏆`,
      `Wow${name} ! ${score}/10 ! C'est exactement ce qu'il te faut ! 🌟`,
      `Parfait ! Un ${score}/10 ! Tu es sur la meilleure voie pour ${goal}${name} ! 💪`,
    ],
    happy: [
      `Bien joué${name} ! ${score}/10, c'est du bon travail pour ${goal} ! 😊`,
      `${score}/10${name} ! Tu fais de vrais progrès vers ton objectif ${goal} ! 🎯`,
      `Super choix${name} ! ${score}/10, continue dans cette direction ! 👍`,
    ],
    warning: [
      `${score}/10${name}... Pas mal, mais tu peux mieux faire pour ${goal} ! 💭`,
      `Hmm${name}, ${score}/10. Ajoute quelques légumes la prochaine fois ? 🥗`,
      `Score de ${score}/10. Un petit effort et tu seras parfait${name} ! 🎯`,
    ],
    sad: [
      `${score}/10${name}... Ce n'est pas idéal pour ${goal}. On fait mieux demain ? 😔`,
      `Aïe${name}, ${score}/10. Pense à ton objectif ${goal} avec des aliments plus nutritifs ! 💚`,
      `${score}/10 cette fois${name}. Rappelle-toi : chaque repas est une nouvelle chance ! 🌱`,
    ],
  };

  const moodMessages = messages[mood] || messages.happy;
  return moodMessages[Math.floor(Math.random() * moodMessages.length)];
}

export default useMascotController;
