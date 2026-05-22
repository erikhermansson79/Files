import { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import i18n from '../i18n';
import { LocaleContext } from '../LocaleContext';
import { UserContext } from '../UserContext';

interface FilesProvidersProps {
    children: ReactNode;
    isAdmin?: boolean;
    disablePagingInFiles?: boolean;
}

export function FilesProviders({ children, isAdmin, disablePagingInFiles }: FilesProvidersProps) {
    const outerUserContext = useContext(UserContext);
    const [locale, setLocale] = useState(i18n.language);

    useEffect(() => {
        const handleLanguageChanged = (language: string) => setLocale(language);

        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const changeLocale = useCallback((language: string) => {
        void i18n.changeLanguage(language);
    }, []);

    const userContextValue = useMemo(() => ({
        isAdmin: isAdmin ?? outerUserContext?.isAdmin ?? false,
        disablePagingInFiles: disablePagingInFiles ?? outerUserContext?.disablePagingInFiles ?? false
    }), [disablePagingInFiles, isAdmin, outerUserContext]);

    return (
        <I18nextProvider i18n={i18n}>
            <LocaleContext.Provider value={{ locale, setLocale: changeLocale }}>
                <UserContext.Provider value={userContextValue}>
                    {children}
                </UserContext.Provider>
            </LocaleContext.Provider>
        </I18nextProvider>
    );
}
