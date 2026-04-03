import { useCallback, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MascotMood } from '../types';

interface MascotControllerReturn {
  triggerReaction: (score: number) => void;
  setMood: (mood: MascotMood) => void;
  setThinking: () => void;
  resetToIdle: () => void;
}

/**
 * Hook pour contrôler la mascotte de manière intelligente
 * Gère les transitions, les délais et les retours automatiques vers idle
 */
export const useMascotController = (): MascotControllerReturn => {
  const { setMascotMood, setMascotMessage, mascotMood } = useStore();
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactionDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
      if (reactionDelayRef.current) {
        clearTimeout(reactionDelayRef.current);
      }
    };
  }, []);

  /**
   * Réinitialise la mascotte vers l'état idle après un délai
   */
  const scheduleResetToIdle = useCallback((delay: number = 3000) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    
    resetTimeoutRef.current = setTimeout(() => {
      setMascotMood('idle');
      setMascotMessage('');
    }, delay);
  }, [setMascotMood, setMascotMessage]);

  /**
   * Déclenche une réaction basée sur le score nutritionnel
   * - score > 9 → excited
   * - score > 7 → happy
   * - score > 4 → warning
   * - score <= 4 → sad
   */
  const triggerReaction = useCallback((score: number) => {
    // Annuler tout reset en cours
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    // Petit délai naturel avant réaction (200-500ms)
    const reactionDelay = 200 + Math.random() * 300;
    
    reactionDelayRef.current = setTimeout(() => {
      let newMood: MascotMood;
      let message: string;

      if (score > 9) {
        newMood = 'excited';
        message = getMascotMessage('excited', score);
      } else if (score > 7) {
        newMood = 'happy';
        message = getMascotMessage('happy', score);
      } else if (score > 4) {
        newMood = 'warning';
        message = getMascotMessage('warning', score);
      } else {
        newMood = 'sad';
        message = getMascotMessage('sad', score);
      }

      setMascotMood(newMood);
      setMascotMessage(message);

      // Programmer le retour à idle après 4 secondes
      scheduleResetToIdle(4000);
    }, reactionDelay);
  }, [setMascotMood, setMascotMessage, scheduleResetToIdle]);

  /**
   * Définir l'humeur manuellement
   */
  const setMood = useCallback((mood: MascotMood) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    setMascotMood(mood);
    
    // Retour à idle après 3 secondes sauf si c'est déjà idle
    if (mood !== 'idle') {
      scheduleResetToIdle(3000);
    }
  }, [setMascotMood, scheduleResetToIdle]);

  /**
   * Activer l'état "thinking" pendant le chargement IA
   */
  const setThinking = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    setMascotMood('thinking');
    setMascotMessage('Hmm, laisse-moi analyser ça...');
  }, [setMascotMood, setMascotMessage]);

  /**
   * Réinitialiser vers idle immédiatement
   */
  const resetToIdle = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    if (reactionDelayRef.current) {
      clearTimeout(reactionDelayRef.current);
    }
    setMascotMood('idle');
    setMascotMessage('');
  }, [setMascotMood, setMascotMessage]);

  return {
    triggerReaction,
    setMood,
    setThinking,
    resetToIdle,
  };
};

/**
 * Génère un message contextuel pour la mascotte
 */
function getMascotMessage(mood: MascotMood, score: number): string {
  const messages = {
    excited: [
      `Incroyable ! Score de ${score}/10 ! Tu gères comme un chef ! 🏆`,
      `Wow ! ${score}/10 ! C'est exactement ce qu'il te faut ! 🌟`,
      `Parfait ! Un ${score}/10 ! Continue comme ça champion ! 💪`,
    ],
    happy: [
      `Super choix ! ${score}/10, c'est du bon travail ! 😊`,
      `Bien joué ! Un score de ${score}/10, tu es sur la bonne voie ! 👍`,
      `${score}/10 ! Tu fais de vrais progrès ! 🎯`,
    ],
    warning: [
      `${score}/10... Pas mal, mais tu peux mieux faire ! 💭`,
      `Hmm, ${score}/10. Ajoute quelques légumes la prochaine fois ? 🥗`,
      `Score de ${score}/10. Un petit effort et ce sera parfait ! 🎯`,
    ],
    sad: [
      `${score}/10... Ce n'est pas ton meilleur choix. On fait mieux demain ? 😔`,
      `Aïe, ${score}/10. Prends soin de toi avec des aliments plus nutritifs ! 💚`,
      `${score}/10 cette fois. Rappelle-toi : chaque repas est une nouvelle chance ! 🌱`,
    ],
  };

  const moodMessages = messages[mood as keyof typeof messages] || messages.happy;
  return moodMessages[Math.floor(Math.random() * moodMessages.length)];
}

export default useMascotController;
