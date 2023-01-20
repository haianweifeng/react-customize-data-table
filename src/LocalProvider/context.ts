import { createContext } from 'react';
import zhCN from '../locales/zh-CN';
import enUS from '../locales/en-US';

const getLocale = () => {
  const isNavigatorLanguageValid =
    typeof navigator !== 'undefined' && typeof navigator.language === 'string';
  const browserLang = isNavigatorLanguageValid ? navigator.language.split('-')[0] : '';
  return browserLang || 'zh';
};

const language = getLocale();

const locale: Record<string, Record<string, Record<string, string>>> = {
  zh: zhCN,
  en: enUS,
};

const LocaleContext = createContext<Record<string, Record<string, string>>>(
  locale[language] || zhCN,
);

export default LocaleContext;
