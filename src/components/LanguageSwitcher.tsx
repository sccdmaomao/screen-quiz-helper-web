import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => {
            i18n.changeLanguage(code)
            localStorage.setItem('lang', code)
          }}
          style={{
            padding: '6px 12px',
            background: i18n.language.startsWith(code) ? '#45475a' : '#313244',
            border: '1px solid #45475a',
            borderRadius: 6,
            color: i18n.language.startsWith(code) ? '#cdd6f4' : '#a6adc8',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
