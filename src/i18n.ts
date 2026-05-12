import { createInstance } from 'i18next';

const i18n = createInstance({
  fallbackLng: 'en',
  debug: true,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },

  resources: {
    en: {
      translation: {
        "files": "Files",
        "previous": "Previous",
        "next": "Next",
        "ago": "ago",
        "close": "Close",
        "loadingPdf": "Loading PDF"
      },
    },
    sv: {
      translation: {
        "files": "Filer",
        "previous": "Föregående",
        "next": "Nästa",
        "ago": "sedan",
        "close": "Stäng",
        "loadingPdf": "Laddar PDF"
      },
    },
  },
});

i18n.init();

export default i18n;
