import React from 'react';
import LocaleContext from './context';

interface LocalProviderProps {
  locale: Record<string, Record<string, string>>;
  children?: React.ReactNode;
}

const LocalProvider = (props: LocalProviderProps) => {
  const { locale, children } = props;
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
};
export default LocalProvider;
