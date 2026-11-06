import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, Mail, MapPin } from 'lucide-react'
import { asset, cv, type Lang } from '../lib/cv'
import { t, type RecruiterField } from '../lib/i18n'

const { personal } = cv

const EMPTY: Record<RecruiterField, string> = { name: '', company: '', role: '', offer: '' }

interface CopyButtonProps {
  copied: boolean
  idle: string
  done: string
  onClick: () => void
}

function CopyButton({ copied, idle, done, onClick }: CopyButtonProps) {
  return (
    <button type="button" className="link-button" onClick={onClick}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'copied' : 'copy'}
          className="copy-label"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.14 }}
        >
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? done : idle}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export function Contact({ lang }: { lang: Lang }) {
  const copy = t(lang)
  const [values, setValues] = useState(EMPTY)
  const [copied, setCopied] = useState<'email' | 'message' | null>(null)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(null), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  const copyText = async (text: string, kind: 'email' | 'message') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
    } catch {
      window.location.href = `mailto:${personal.email}`
    }
  }

  // La propuesta es opcional: sin ella, esa oración no va en el correo
  const parts = copy.recruiterMessage.filter(
    (part) => !('optional' in part) || values.offer.trim() !== '',
  )
  const message = parts
    .map((part) => ('field' in part ? values[part.field].trim() : part.text))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const subject = encodeURIComponent(copy.mailSubject(values.role.trim(), values.company.trim()))
    const body = encodeURIComponent(message)
    window.location.href = `mailto:${personal.email}?subject=${subject}&body=${body}`
  }

  return (
    <>
      <h1 className="section-title">{copy.contact}</h1>
      <p className="bio">{copy.contactIntro}</p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <p className="message">
          {copy.recruiterMessage.map((part, index) => {
            if (!('field' in part)) return <span key={index}>{part.text}</span>
            const { field, placeholder, label } = part
            return (
              <label key={field} className="blank" data-value={values[field] || placeholder}>
                <input
                  type="text"
                  name={field}
                  aria-label={label}
                  placeholder={placeholder}
                  required={field !== 'offer'}
                  autoComplete={field === 'name' ? 'name' : field === 'company' ? 'organization' : 'off'}
                  size={1}
                  value={values[field]}
                  onChange={(event) => setValues({ ...values, [field]: event.target.value })}
                />
              </label>
            )
          })}
        </p>

        <div className="contact-actions">
          <motion.button type="submit" className="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Mail size={18} aria-hidden="true" />
            {copy.openMail}
          </motion.button>
          <CopyButton
            copied={copied === 'message'}
            idle={copy.copyMessage}
            done={copy.copied}
            onClick={() => copyText(message, 'message')}
          />
        </div>
      </form>

      <div className="contact-direct">
        <div className="contact-row">
          <a className="contact-email" href={`mailto:${personal.email}`}>
            {personal.email}
          </a>
          <CopyButton
            copied={copied === 'email'}
            idle={copy.copyEmail}
            done={copy.copied}
            onClick={() => copyText(personal.email, 'email')}
          />
        </div>

        <div
          className="contact-map"
          style={{ backgroundImage: `url(${asset(personal.contactMap)})` }}
          role="img"
          aria-label={personal.location}
        >
          <motion.span
            className="contact-pin"
            initial={{ scale: 0, y: -24 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14, delay: 0.3 }}
          >
            <MapPin size={30} strokeWidth={2} aria-hidden="true" />
          </motion.span>
          <a
            className="contact-credit"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            © OpenStreetMap
          </a>
        </div>
        <p className="hint">{personal.location}</p>
      </div>
    </>
  )
}
