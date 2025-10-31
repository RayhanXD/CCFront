import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Define available languages
export const languages = {
  en: {
    name: 'English',
    code: 'en',
    translations: {
      settings: {
        title: 'Settings',
        darkMode: 'Dark Mode',
        language: 'Language',
        deactivateAccount: 'Deactivate Account',
        aboutUs: 'About Us',
        selectLanguage: 'Select Language',
        back: 'Back',
        save: 'Save',
        appearance: 'Appearance',
        preferences: 'Preferences',
        aboutSupport: 'About & Support',
        notifications: 'Notifications',
        privacyMode: 'Privacy Mode',
      },
      aboutUs: {
        title: 'About Us',
        description: 'Campus Connect is a platform designed to help students discover opportunities, connect with organizations, and stay updated with campus events. Our mission is to enhance the student experience by providing a centralized hub for all campus-related activities and resources.',
        version: 'Version',
        contactUs: 'Contact Us',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
      },
      profile: {
        title: 'Profile',
        edit: 'Edit',
        interests: 'Interests',
        savedItems: 'Saved Items',
        settings: 'Settings',
        yourActivity: 'Your Activity',
        organizations: 'Organizations',
        scholarships: 'Scholarships',
        events: 'Events',
        logout: 'Logout',
      },
    },
  },
  es: {
    name: 'Español',
    code: 'es',
    translations: {
      settings: {
        title: 'Configuración',
        darkMode: 'Modo Oscuro',
        language: 'Idioma',
        deactivateAccount: 'Desactivar Cuenta',
        aboutUs: 'Sobre Nosotros',
        selectLanguage: 'Seleccionar Idioma',
        back: 'Atrás',
        save: 'Guardar',
        appearance: 'Apariencia',
        preferences: 'Preferencias',
        aboutSupport: 'Acerca de & Soporte',
        notifications: 'Notificaciones',
        privacyMode: 'Modo de Privacidad',
      },
      aboutUs: {
        title: 'Sobre Nosotros',
        description: 'Campus Connect es una plataforma diseñada para ayudar a los estudiantes a descubrir oportunidades, conectarse con organizaciones y mantenerse actualizados con los eventos del campus. Nuestra misión es mejorar la experiencia estudiantil proporcionando un centro centralizado para todas las actividades y recursos relacionados con el campus.',
        version: 'Versión',
        contactUs: 'Contáctenos',
        termsOfService: 'Términos de Servicio',
        privacyPolicy: 'Política de Privacidad',
      },
      profile: {
        title: 'Perfil',
        edit: 'Editar',
        interests: 'Intereses',
        savedItems: 'Elementos Guardados',
        settings: 'Configuración',
        yourActivity: 'Tu Actividad',
        organizations: 'Organizaciones',
        scholarships: 'Becas',
        events: 'Eventos',
        logout: 'Cerrar Sesión',
      },
    },
  },
  fr: {
    name: 'Français',
    code: 'fr',
    translations: {
      settings: {
        title: 'Paramètres',
        darkMode: 'Mode Sombre',
        language: 'Langue',
        deactivateAccount: 'Désactiver le Compte',
        aboutUs: 'À Propos de Nous',
        selectLanguage: 'Sélectionner la Langue',
        back: 'Retour',
        save: 'Enregistrer',
        appearance: 'Apparence',
        preferences: 'Préférences',
        aboutSupport: 'À Propos & Support',
        notifications: 'Notifications',
        privacyMode: 'Mode de Confidentialité',
      },
      aboutUs: {
        title: 'À Propos de Nous',
        description: 'Campus Connect est une plateforme conçue pour aider les étudiants à découvrir des opportunités, à se connecter avec des organisations et à rester informés des événements du campus. Notre mission est d\'améliorer l\'expérience des étudiants en fournissant un centre centralisé pour toutes les activités et ressources liées au campus.',
        version: 'Version',
        contactUs: 'Contactez-nous',
        termsOfService: 'Conditions d\'Utilisation',
        privacyPolicy: 'Politique de Confidentialité',
      },
      profile: {
        title: 'Profil',
        edit: 'Modifier',
        interests: 'Intérêts',
        savedItems: 'Éléments Sauvegardés',
        settings: 'Paramètres',
        yourActivity: 'Votre Activité',
        organizations: 'Organisations',
        scholarships: 'Bourses',
        events: 'Événements',
        logout: 'Déconnexion',
      },
    },
  },
};

type LanguageCode = keyof typeof languages;
type TranslationsType = typeof languages.en.translations;

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: TranslationsType;
  availableLanguages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: languages.en.translations,
  availableLanguages: languages,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  // Load language preference from storage on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@language_preference');
        
        if (savedLanguage !== null && savedLanguage in languages) {
          setLanguageState(savedLanguage as LanguageCode);
        } else {
          // Use device locale as default if no saved preference
          const deviceLocale = Localization.locale.split('-')[0];
          setLanguageState((deviceLocale in languages ? deviceLocale : 'en') as LanguageCode);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, []);

  // Set language function
  const setLanguage = async (code: LanguageCode) => {
    try {
      setLanguageState(code);
      await AsyncStorage.setItem('@language_preference', code);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Get translations for current language
  const t = languages[language].translations;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: languages }}>
      {children}
    </LanguageContext.Provider>
  );
};
