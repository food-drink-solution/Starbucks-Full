import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Logo } from '@/components/ui'

const COOKIE_KEY = 'starbucks_cookie_consent'

interface Prefs {
  functional: boolean
  advertising: boolean
}

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green ${checked ? 'bg-starbucks-green' : 'bg-gray-300 dark:bg-zinc-600'}`}
    role="switch"
    aria-checked={checked}
    aria-label={label}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${checked ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'}`}
      aria-hidden="true"
    />
  </button>
)

const CookieConsent: React.FC = () => {
  const { t } = useTranslation('common')

  const [visible, setVisible] = useState(() => !localStorage.getItem(COOKIE_KEY))
  const [showPrefs, setShowPrefs] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>({ functional: true, advertising: false })

  React.useEffect(() => {
    const handleOpen = () => {
      setVisible(true)
      setShowPrefs(true)
    }
    window.addEventListener('openCookieSettings', handleOpen)
    return () => window.removeEventListener('openCookieSettings', handleOpen)
  }, [])

  const save = (value: string) => {
    localStorage.setItem(COOKIE_KEY, value)
    window.dispatchEvent(new Event('starbucks-cookie-consent'))
    setVisible(false)
  }

  const acceptAll = () => save('accepted')
  const declineAll = () => save('declined')
  const submitPrefs = () => save(JSON.stringify({ required: true, ...prefs }))

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-9999 bg-white dark:bg-zinc-900 shadow-[0_-4px_40px_rgba(0,0,0,0.18)] border-t border-gray-200 dark:border-zinc-700"
          role="region"
          aria-label="Cookie Consent"
          aria-live="polite"
        >
          {/* ── Preferences Panel ── */}
          <AnimatePresence>
            {showPrefs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-y-auto scrollbar-thin max-h-[60vh] md:max-h-[70vh] border-b border-gray-200 dark:border-zinc-700"
                role="region"
                aria-label="Cookie Preferences"
              >
                <div className="container mx-auto max-w-3xl px-6 py-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Logo className="h-8 w-8 shrink-0 object-contain" />
                    <h2 className="text-base font-extrabold text-starbucks-dark dark:text-white">
                      {t('cookieConsent.title')}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('cookieConsent.prefsDesc')}
                  </p>

                  {/* Required — always on */}
                  <div className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 dark:bg-zinc-800 p-5 border dark:border-zinc-700">
                    <div className="flex-1">
                      <p className="font-extrabold text-starbucks-dark dark:text-white mb-1">
                        {t('cookieConsent.requiredTitle')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('cookieConsent.requiredDesc')}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-xs font-bold text-starbucks-green uppercase tracking-widest">{t('cookieConsent.alwaysOn')}</span>
                    </div>
                  </div>

                  {/* Functional */}
                  <div className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 dark:bg-zinc-800 p-5 border dark:border-zinc-700">
                    <div className="flex-1">
                      <p className="font-extrabold text-starbucks-dark dark:text-white mb-1">
                        {t('cookieConsent.functionalTitle')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('cookieConsent.functionalDesc')}
                      </p>
                    </div>
                    <Toggle 
                      checked={prefs.functional} 
                      onChange={() => setPrefs(p => ({ ...p, functional: !p.functional }))}
                      label={`${t('cookieConsent.functionalTitle')} - ${prefs.functional ? 'enabled' : 'disabled'}`}
                    />
                  </div>

                  {/* Advertising */}
                  <div className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 dark:bg-zinc-800 p-5 border dark:border-zinc-700">
                    <div className="flex-1">
                      <p className="font-extrabold text-starbucks-dark dark:text-white mb-1">
                        {t('cookieConsent.advertisingTitle')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('cookieConsent.advertisingDesc')}
                      </p>
                    </div>
                    <Toggle 
                      checked={prefs.advertising} 
                      onChange={() => setPrefs(p => ({ ...p, advertising: !p.advertising }))}
                      label={`${t('cookieConsent.advertisingTitle')} - ${prefs.advertising ? 'enabled' : 'disabled'}`}
                    />
                  </div>

                  {/* Functionality list */}
                  <div className="rounded-xl border dark:border-zinc-700 overflow-hidden">
                    <div className="bg-gray-100 dark:bg-zinc-800 px-5 py-3 border-b dark:border-zinc-700">
                      <p className="text-sm font-extrabold text-starbucks-dark dark:text-white">{t('cookieConsent.functionalityAllowed')}</p>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-zinc-700">
                      {(t('cookieConsent.items', { returnObjects: true }) as string[]).map((item: string) => (
                        <li key={item} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-starbucks-green" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prefs actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setShowPrefs(false)}
                      className="rounded-full border-2 border-gray-300 dark:border-zinc-600 px-8 py-3 text-sm font-extrabold text-gray-600 dark:text-gray-300 hover:border-starbucks-dark hover:text-starbucks-dark dark:hover:border-white dark:hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
                    >
                      {t('cookieConsent.cancel')}
                    </button>
                    <button
                      onClick={submitPrefs}
                      className="rounded-full bg-starbucks-green px-8 py-3 text-sm font-extrabold text-white hover:bg-starbucks-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
                    >
                      {t('cookieConsent.submitPrefs')}
                    </button>
                    <button
                      onClick={declineAll}
                      className="rounded-full border-2 border-gray-300 dark:border-zinc-600 px-8 py-3 text-sm font-extrabold text-gray-600 dark:text-gray-300 hover:border-starbucks-dark hover:text-starbucks-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
                    >
                      {t('cookieConsent.decline')}
                    </button>
                  </div>

                  {/* TrustArc + legal links */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t dark:border-zinc-700">
                    <div className="flex gap-4 text-xs text-gray-400">
                      <Link to="/privacy-statement" className="hover:text-starbucks-green transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green rounded px-1" onClick={acceptAll}>{t('cookieConsent.privacyPolicy')}</Link>
                      <Link to="/terms-of-use" className="hover:text-starbucks-green transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green rounded px-1" onClick={acceptAll}>{t('cookieConsent.termsOfUse')}</Link>
                      <Link to="/cookie-notice" className="hover:text-starbucks-green transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green rounded px-1" onClick={acceptAll}>{t('cookieConsent.cookieNotice')}</Link>
                      <Link to="/cookie-notice" className="hover:text-starbucks-green transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green rounded px-1" onClick={acceptAll}>{t('cookieConsent.cookiePolicy')}</Link>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{t('cookieConsent.poweredBy')}</span>
                      <span className="font-bold text-gray-500 dark:text-gray-400">TrustArc</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Bar ── */}
          <div className="container mx-auto max-w-6xl px-6 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left: logo + text */}
              <div className="flex items-start gap-3 flex-1">
                <Logo className="h-8 w-8 shrink-0 object-contain mt-0.5" />
                <div>
                  <p className="text-sm font-extrabold text-starbucks-dark dark:text-white mb-0.5">
                    {t('cookieConsent.title')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
                    {t('cookieConsent.body')}
                  </p>
                </div>
              </div>

              {/* Right: buttons */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={acceptAll}
                  className="rounded-full bg-starbucks-green px-6 py-2.5 text-sm font-extrabold text-white hover:bg-starbucks-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
                >
                  {t('cookieConsent.agree')}
                </button>
                <button
                  onClick={declineAll}
                  className="rounded-full border-2 border-gray-300 dark:border-zinc-600 px-6 py-2.5 text-sm font-extrabold text-gray-600 dark:text-gray-300 hover:border-starbucks-dark hover:text-starbucks-dark transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
                >
                  {t('cookieConsent.decline')}
                </button>
                <button
                  onClick={() => setShowPrefs(v => !v)}
                  className="rounded-full px-6 py-2.5 text-sm font-extrabold text-starbucks-green hover:underline transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green"
                >
                  {t('cookieConsent.more')}
                </button>
                <button 
                  onClick={declineAll} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-starbucks-green rounded p-1"
                  aria-label="Close cookie consent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { CookieConsent }
export default CookieConsent
