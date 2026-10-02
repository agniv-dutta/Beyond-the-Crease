import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LANGUAGES, RESOURCES } from './resources';
import type { LanguageCode } from '@/types';

export const LANGUAGE_STORAGE_KEY = 'btc.prefs';

void i18n.use(initReactI18next).init({
  resources: RESOURCES,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLanguage(code: LanguageCode): void {
  const meta = LANGUAGES.find((l) => l.code === code);
  void i18n.changeLanguage(code);
  const root = document.documentElement;
  root.setAttribute('lang', code);
  root.setAttribute('dir', meta?.dir ?? 'ltr');
}

export function currentLanguage(): LanguageCode {
  return (i18n.language?.split('-')[0] as LanguageCode) ?? 'en';
}

export default i18n;
