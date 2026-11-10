import { AnimatePresence, motion } from 'motion/react'
import { FileDown } from 'lucide-react'
import { resumePdf, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'
import { Flag } from './Flag'

interface PreferencesProps {
  className: string
  lang: Lang
  onLang: (lang: Lang) => void
}

// La bandera muestra el idioma actual; el click pasa al otro
export function Preferences({ className, lang, onLang }: PreferencesProps) {
  const copy = t(lang)
  const label = copy.switchLang
  return (
    <div className={`preferences ${className}`}>
      <a className="rail-button" href={resumePdf(lang)} download aria-label={copy.downloadPdf}>
        <FileDown size={20} strokeWidth={1.75} aria-hidden="true" />
        <span className="rail-label">{copy.downloadPdf}</span>
      </a>
      <motion.button
        type="button"
        className="lang"
        aria-label={label}
        title={label}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => onLang(lang === 'es' ? 'en' : 'es')}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={lang}
            className="lang-face"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.14 }}
          >
            <Flag code={lang === 'es' ? 'ar' : 'us'} className="lang-flag" />
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
