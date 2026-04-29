// Settings Page Component - User preferences and language settings

import { Link } from 'react-router-dom'
import { useLanguageStore, type Language } from '../../stores/languageStore'

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguageStore()

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'zh', label: '简体中文', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/workflows" className="text-gray-500 hover:text-gray-700">
          ← {t('common.back')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{t('settings.title')}</h1>
      </div>

      <div className="space-y-6">
        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{t('settings.language')}</h2>
          <p className="text-sm text-gray-500 mb-4">{t('settings.languageDesc')}</p>

          <div className="flex gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  language === lang.code
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{t('settings.theme')}</h2>
          <p className="text-sm text-gray-500 mb-4">{t('settings.themeDesc')}</p>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 bg-blue-50 text-blue-700">
              <span>☀️</span>
              <span className="font-medium">Light</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700">
              <span>🌙</span>
              <span className="font-medium">Dark</span>
            </button>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">{t('settings.about')}</h2>
          <div className="text-sm text-gray-500 space-y-1">
            <p>SnapFlow - No-Code Visual Web Scraper</p>
            <p>{t('settings.version')}: 0.1.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
