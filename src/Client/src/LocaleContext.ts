import React from "react";

const defaultValue = {
    locale: 'sv',
    setLocale: (locale) => { }
}

export const LocaleContext = React.createContext(defaultValue);