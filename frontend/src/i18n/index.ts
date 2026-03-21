import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import fr from './locales/fr';
import de from './locales/de';
import it from './locales/it';

const i18n = new I18n({
  fr,
  de,
  it,
});

// Set the locale from device, default to French
const deviceLocale = Localization.getLocales()[0]?.languageCode || 'fr';
i18n.locale = ['fr', 'de', 'it'].includes(deviceLocale) ? deviceLocale : 'fr';

i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export default i18n;
