import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FileDown, FileText, LayoutTemplate, type LucideIcon } from 'lucide-react'
import { resumePdf, type Lang, type ResumeKind } from '../lib/cv'
import { t } from '../lib/i18n'

export const RESUME_KINDS: { kind: ResumeKind; icon: LucideIcon }[] = [
  { kind: 'visual', icon: LayoutTemplate },
  { kind: 'ats', icon: FileText },
]

// Botón del costado que abre las dos versiones del CV
export function DownloadMenu({ lang }: { lang: Lang }) {
  const copy = t(lang)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    root.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) return
    if (event.key === 'Escape') {
      setOpen(false)
      trigger.current?.focus()
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = [...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const current = items.indexOf(document.activeElement as HTMLElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(current + step + items.length) % items.length]?.focus()
  }

  return (
    <div
      ref={root}
      className="download"
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="rail-button"
        aria-label={copy.downloadCv}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        data-open={open}
        onClick={() => setOpen(!open)}
      >
        <FileDown size={20} strokeWidth={1.75} aria-hidden="true" />
        <span className="rail-label">{copy.downloadCv}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            className="download-menu"
            role="menu"
            aria-label={copy.downloadCv}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14 }}
          >
            {RESUME_KINDS.map(({ kind, icon: Icon }) => (
              <a
                key={kind}
                className="download-item"
                role="menuitem"
                href={resumePdf(lang, kind)}
                download
                onClick={() => setOpen(false)}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>
                  <strong>{copy.resumes[kind].title}</strong>
                  <span>{copy.resumes[kind].hint}</span>
                </span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
