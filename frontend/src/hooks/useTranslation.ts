import { useStore } from '../store/useStore';
import i18n from '../i18n';

// Subscribes to language changes in the store, forcing a re-render
// so that all translated strings update instantly across the app.
export const useTranslation = () => {
  useStore((state) => state.language);
  return i18n.t.bind(i18n);
};

export default useTranslation;
