import { motion } from 'motion/react'
import { FolderGit2, Glasses, Mail, Pencil, User, type LucideIcon } from 'lucide-react'
import { cv, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'
import { Preferences } from './Preferences'

export type SectionId = 'about' | 'experience' | 'projects' | 'studies' | 'contact'

export const SECTIONS: { id: SectionId; icon: LucideIcon }[] = [
  { id: 'about', icon: User },
  { id: 'experience', icon: Glasses },
  { id: 'projects', icon: FolderGit2 },
  { id: 'studies', icon: Pencil },
  { id: 'contact', icon: Mail },
]

const initials = cv.personal.fullName
  .split(' ')
  .map((name) => name[0])
  .join('')

interface RailProps {
  active: SectionId
  onSelect: (section: SectionId) => void
  lang: Lang
  onLang: (lang: Lang) => void
}

export function Rail({ active, onSelect, lang, onLang }: RailProps) {
  const copy = t(lang)

  return (
    <motion.nav
      className="rail"
      aria-label={copy.sections}
      layoutRoot
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <span className="rail-initials" aria-hidden="true">
        {initials}
      </span>

      <ul className="rail-nav">
        {SECTIONS.map(({ id, icon: Icon }) => {
          const label = copy.nav[id]
          const isActive = active === id
          return (
            <li key={id}>
              <button
                type="button"
                className="rail-button"
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive}
                onClick={() => onSelect(id)}
              >
                {isActive && (
                  <motion.span
                    className="rail-indicator"
                    layoutId="rail-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                <span className="rail-label">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <Preferences className="rail-preferences" lang={lang} onLang={onLang} />
    </motion.nav>
  )
}
