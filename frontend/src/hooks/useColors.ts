import { useTheme } from '../contexts/ThemeContext';

/**
 * Convenience hook — returns theme-aware colors.
 * Drop-in replacement for the static COLORS import:
 *   const COLORS = useColors();
 */
export const useColors = () => {
  const { colors } = useTheme();
  return colors;
};

export default useColors;
