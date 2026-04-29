// Settings Page Component - User preferences and language settings

import { Link } from 'react-router-dom'
import { useLanguageStore, type Language } from '../../stores/languageStore'
import { Globe, Moon, Sun, Info, Check } from 'lucide-react'

export default function SettingsPage() {
  const { language, setLanguage } = useLanguageStore()

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'zh', label: '简体中文', native: 'Chinese' },
    { code: 'en', label: 'English', native: '英文' },
  ]

  const themes = [
    { id: 'light', label: '浅色', icon: Sun, active: true },
    { id: 'dark', label: '深色', icon: Moon, active: false },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-10 animate-fade-in-up">
        <Link
          to="/workflows"
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4"
        >
          ← 返回
        </Link>
        <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">设置</h1>
        <p className="text-text-secondary mt-1">自定义您的 SnapFlow 体验</p>
      </div>

      <div className="space-y-5">
        {/* Language Settings */}
        <div className="bg-white border border-border rounded-[16px] p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold font-display text-text-primary">语言</h2>
              <p className="text-xs text-text-muted">选择界面显示语言</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 flex items-center justify-between px-5 py-3.5 rounded-[12px] border transition-all ${
                  language === lang.code
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border hover:border-primary/30 bg-white'
                }`}
              >
                <div className="text-left">
                  <div className="text-sm font-semibold text-text-primary">{lang.label}</div>
                  <div className="text-xs text-text-muted">{lang.native}</div>
                </div>
                {language === lang.code && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white border border-border rounded-[16px] p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold font-display text-text-primary">主题</h2>
              <p className="text-xs text-text-muted">选择界面外观</p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            {themes.map((theme) => {
              const Icon = theme.icon
              return (
                <button
                  key={theme.id}
                  className={`flex-1 flex items-center gap-3 px-5 py-3.5 rounded-[12px] border transition-all ${
                    theme.active
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 bg-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${theme.active ? 'text-primary' : 'text-text-muted'}`} />
                  <span className={`text-sm font-medium ${theme.active ? 'text-primary' : 'text-text-secondary'}`}>
                    {theme.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* About */}
        <div className="bg-white border border-border rounded-[16px] p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <h2 className="text-base font-semibold font-display text-text-primary">关于</h2>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-secondary">产品</span>
              <span className="text-text-primary font-medium">SnapFlow</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-text-secondary">版本</span>
              <span className="text-text-primary font-mono text-xs">0.1.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">描述</span>
              <span className="text-text-primary text-xs text-right max-w-[200px]">无代码可视化网页采集工具</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
