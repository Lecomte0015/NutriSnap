import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, G, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { MascotMood } from '../types';

interface MascotAnimatedProps {
  mood: MascotMood;
  size?: number;
  primaryColor?: string;
}

// Couleurs de la mascotte
const COLORS = {
  primary: '#2fa4a7',
  primaryDark: '#238a8c',
  primaryLight: '#4dbfc2',
  white: '#FFFFFF',
  black: '#1a1a1a',
  cheek: '#ff9999',
  holes: '#1a8a8c',
};

/**
 * Composant Mascotte Animée - Fromage suisse stylisé
 * Utilise React Native Reanimated pour des animations fluides 60fps
 */
export const MascotAnimated: React.FC<MascotAnimatedProps> = ({
  mood,
  size = 150,
  primaryColor = COLORS.primary,
}) => {
  // Animation values
  const bodyY = useSharedValue(0);
  const bodyScale = useSharedValue(1);
  const bodyRotate = useSharedValue(0);
  const bounceValue = useSharedValue(0);
  const breathValue = useSharedValue(0);
  const wiggleValue = useSharedValue(0);
  
  const prevMood = useRef<MascotMood>(mood);
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation de respiration permanente (idle)
  useEffect(() => {
    breathValue.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(breathValue);
    };
  }, []);

  // Animations spécifiques à chaque humeur
  useEffect(() => {
    // Reset des animations
    cancelAnimation(bodyY);
    cancelAnimation(bodyScale);
    cancelAnimation(bodyRotate);
    cancelAnimation(bounceValue);
    cancelAnimation(wiggleValue);

    switch (mood) {
      case 'excited':
        // Saut + énergie
        bounceValue.value = withRepeat(
          withSequence(
            withSpring(-20, { damping: 4, stiffness: 200 }),
            withSpring(0, { damping: 4, stiffness: 200 })
          ),
          -1,
          false
        );
        bodyScale.value = withRepeat(
          withSequence(
            withSpring(1.15, { damping: 6 }),
            withSpring(0.95, { damping: 6 }),
            withSpring(1.05, { damping: 8 })
          ),
          -1,
          true
        );
        break;

      case 'happy':
        // Mouvement positif / sourire
        wiggleValue.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(8, { duration: 300, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        bodyScale.value = withSpring(1.05);
        break;

      case 'warning':
        // Regard sérieux - léger tremblement
        wiggleValue.value = withRepeat(
          withSequence(
            withTiming(-2, { duration: 100 }),
            withTiming(2, { duration: 100 })
          ),
          3,
          true
        );
        bodyScale.value = withSpring(0.98);
        break;

      case 'sad':
        // Posture déçue
        bodyY.value = withTiming(10, { duration: 500 });
        bodyScale.value = withSpring(0.92);
        bodyRotate.value = withTiming(-3, { duration: 500 });
        break;

      case 'thinking':
        // Réflexion
        bodyScale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 1000 }),
            withTiming(0.98, { duration: 1000 })
          ),
          -1,
          true
        );
        break;

      default:
        // Idle - retour aux valeurs par défaut avec animation douce
        bodyY.value = withSpring(0);
        bodyScale.value = withSpring(1);
        bodyRotate.value = withSpring(0);
        break;
    }

    prevMood.current = mood;
  }, [mood]);

  // Style animé pour le conteneur principal
  const bodyAnimatedStyle = useAnimatedStyle(() => {
    const breathOffset = interpolate(breathValue.value, [0, 1], [0, 3]);
    
    return {
      transform: [
        { translateY: bodyY.value + bounceValue.value + breathOffset },
        { scale: bodyScale.value },
        { rotate: `${bodyRotate.value + wiggleValue.value}deg` },
      ],
    };
  });

  // Rendu du chemin de la bouche selon l'humeur
  const getMouthPath = useMemo(() => {
    switch (mood) {
      case 'excited':
        return 'M70 130 Q100 165 130 130'; // Grand sourire
      case 'happy':
        return 'M75 125 Q100 150 125 125'; // Sourire
      case 'warning':
        return 'M75 135 L125 135'; // Ligne neutre
      case 'sad':
        return 'M75 145 Q100 125 125 145'; // Triste inversé
      case 'thinking':
        return 'M85 135 Q100 140 115 135'; // Légèrement incurvé
      default:
        return 'M80 130 Q100 145 120 130'; // Sourire léger
    }
  }, [mood]);

  // Épaisseur de la bouche
  const mouthStrokeWidth = mood === 'excited' ? 4 : 3;

  // Taille des yeux selon l'humeur
  const eyeScale = useMemo(() => {
    switch (mood) {
      case 'excited': return 1.3;
      case 'happy': return 1.1;
      case 'warning': return 0.9;
      case 'sad': return 0.85;
      default: return 1;
    }
  }, [mood]);

  // Sourcils selon l'humeur
  const renderEyebrows = () => {
    switch (mood) {
      case 'excited':
        return (
          <G>
            <Path d="M65 85 Q75 78 85 85" stroke={COLORS.primaryDark} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M115 85 Q125 78 135 85" stroke={COLORS.primaryDark} strokeWidth={3} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'warning':
        return (
          <G>
            <Path d="M62 92 L88 97" stroke={COLORS.primaryDark} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M138 92 L112 97" stroke={COLORS.primaryDark} strokeWidth={3} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'sad':
        return (
          <G>
            <Path d="M65 97 Q75 92 85 97" stroke={COLORS.primaryDark} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M115 97 Q125 92 135 97" stroke={COLORS.primaryDark} strokeWidth={3} fill="none" strokeLinecap="round" />
          </G>
        );
      case 'thinking':
        return (
          <G>
            <Path d="M65 90 Q75 94 85 90" stroke={COLORS.primaryDark} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d="M115 94 Q125 90 135 94" stroke={COLORS.primaryDark} strokeWidth={2} fill="none" strokeLinecap="round" />
          </G>
        );
      default:
        return null;
    }
  };

  // Offset des yeux pour thinking
  const eyeOffsetX = mood === 'thinking' ? 3 : 0;

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, bodyAnimatedStyle]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <RadialGradient id="bodyGradient" cx="40%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={COLORS.primaryLight} />
            <Stop offset="100%" stopColor={primaryColor} />
          </RadialGradient>
          <RadialGradient id="shineGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Corps principal - forme de fromage arrondi */}
        <Path
          d="M50 45 L150 45 Q170 45 170 70 L170 150 Q170 175 145 175 L55 175 Q30 175 30 150 L30 70 Q30 45 50 45 Z"
          fill="url(#bodyGradient)"
        />

        {/* Trous du fromage */}
        <Ellipse cx={60} cy={80} rx={12} ry={10} fill={COLORS.holes} opacity={0.6} />
        <Ellipse cx={140} cy={95} rx={10} ry={8} fill={COLORS.holes} opacity={0.6} />
        <Ellipse cx={70} cy={150} rx={8} ry={7} fill={COLORS.holes} opacity={0.6} />
        <Ellipse cx={130} cy={155} rx={9} ry={7} fill={COLORS.holes} opacity={0.5} />
        <Circle cx={150} cy={140} r={5} fill={COLORS.holes} opacity={0.4} />

        {/* Reflet/shine */}
        <Ellipse cx={70} cy={65} rx={25} ry={12} fill="url(#shineGradient)" />

        {/* Sourcils */}
        {renderEyebrows()}

        {/* Yeux */}
        <G>
          {/* Œil gauche */}
          <Circle 
            cx={75 + eyeOffsetX} 
            cy={105} 
            r={12 * eyeScale} 
            fill={COLORS.white} 
          />
          <Circle 
            cx={78 + eyeOffsetX} 
            cy={107} 
            r={6 * eyeScale} 
            fill={COLORS.black} 
          />
          <Circle 
            cx={80 + eyeOffsetX} 
            cy={104} 
            r={2} 
            fill={COLORS.white} 
          />
          
          {/* Œil droit */}
          <Circle 
            cx={125 + eyeOffsetX} 
            cy={105} 
            r={12 * eyeScale} 
            fill={COLORS.white} 
          />
          <Circle 
            cx={128 + eyeOffsetX} 
            cy={107} 
            r={6 * eyeScale} 
            fill={COLORS.black} 
          />
          <Circle 
            cx={130 + eyeOffsetX} 
            cy={104} 
            r={2} 
            fill={COLORS.white} 
          />
        </G>

        {/* Joues */}
        <Ellipse 
          cx={55} 
          cy={125} 
          rx={10} 
          ry={6} 
          fill={COLORS.cheek} 
          opacity={mood === 'happy' || mood === 'excited' ? 0.7 : 0.4} 
        />
        <Ellipse 
          cx={145} 
          cy={125} 
          rx={10} 
          ry={6} 
          fill={COLORS.cheek} 
          opacity={mood === 'happy' || mood === 'excited' ? 0.7 : 0.4} 
        />

        {/* Bouche */}
        <Path
          d={getMouthPath}
          stroke={COLORS.black}
          strokeWidth={mouthStrokeWidth}
          strokeLinecap="round"
          fill="none"
        />

        {/* Dents pour excited */}
        {mood === 'excited' && (
          <G>
            <Rect x={90} y={138} width={8} height={10} rx={2} fill={COLORS.white} />
            <Rect x={102} y={138} width={8} height={10} rx={2} fill={COLORS.white} />
          </G>
        )}

        {/* Larme pour sad */}
        {mood === 'sad' && (
          <Ellipse cx={138} cy={120} rx={4} ry={6} fill="#87CEEB" opacity={0.8} />
        )}

        {/* Points de réflexion pour thinking */}
        {mood === 'thinking' && (
          <G>
            <Circle cx={160} cy={60} r={4} fill={COLORS.primaryDark} opacity={0.5} />
            <Circle cx={170} cy={50} r={5} fill={COLORS.primaryDark} opacity={0.6} />
            <Circle cx={182} cy={38} r={6} fill={COLORS.primaryDark} opacity={0.7} />
          </G>
        )}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MascotAnimated;
