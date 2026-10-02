import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage as applyLanguage } from '@/i18n';
import { usePrefs } from '@/store/prefs';
import type { LanguageCode } from '@/types';

/**
 * Thin wrapper over react-i18next so components never touch the i18n object
 * directly, and language changes go through the persisted prefs store.
 */
export function useLanguage() {
  const { t, i18n } = useTranslation();
  const language = usePrefs((s) => s.language);
  const setPrefsLanguage = usePrefs((s) => s.setLanguage);

  const setLanguage = useCallback(
    (code: LanguageCode) => {
      setPrefsLanguage(code);
      applyLanguage(code);
    },
    [setPrefsLanguage],
  );

  const dir = i18n.dir?.() ?? 'ltr';

  return useMemo(
    () => ({
      t,
      i18n,
      language,
      setLanguage,
      dir,
      /** Translate a dotted key, falling back to the key itself. */
      hasKey: (key: string) => Boolean(t(key, { defaultValue: '' })),
    }),
    [t, i18n, language, setLanguage, dir],
  );
}