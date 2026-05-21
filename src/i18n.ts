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
        "loadingPdf": "Loading PDF",
        "list": "List",
        "grid_small": "Small icons",
        "grid_large": "Large icons"
      },
    },
    sv: {
      translation: {
        "files": "Filer",
        "previous": "Föregående",
        "next": "Nästa",
        "ago": "sedan",
        "close": "Stäng",
        "loadingPdf": "Laddar PDF",
        "list": "Lista",
        "grid_small": "Små ikoner",
        "grid_large": "Stora ikoner"
      },
    },
  },
});

i18n.init();

export default i18n;
