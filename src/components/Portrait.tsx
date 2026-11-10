import { motion } from 'motion/react'
import { FileDown, Mail } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { asset, cv, resumePdf, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'
import { Preferences } from './Preferences'

const { personal } = cv

const nameVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.028, delayChildren: 0.75 } },
}

const letterVariants = {
  hidden: { y: '110%' },
  visible: { y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

interface PortraitProps {
  lang: Lang
  onLang: (lang: Lang) => void
}

export function Portrait({ lang, onLang }: PortraitProps) {
  return (
    <motion.aside
      className="portrait"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="portrait-photo">
        <img src={asset(personal.photo)} alt={personal.fullName} />
        <span className="portrait-shade" aria-hidden="true" />
      </div>

      <Preferences className="portrait-preferences" lang={lang} onLang={onLang} />

      <div className="portrait-info">
        <motion.h2
          className="portrait-name"
          aria-label={personal.fullName}
          variants={nameVariants}
          initial="hidden"
          animate="visible"
        >
          {personal.fullName.split(' ').map((word) => (
            <span key={word} className="portrait-word" aria-hidden="true">
              {[...word].map((letter, index) => (
                <motion.span key={index} className="portrait-letter" variants={letterVariants}>
                  {letter}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h2>
        <p className="portrait-role">{personal.role[lang]}</p>
        <div className="portrait-links">
          <a href={personal.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <FaGithub size={20} aria-hidden="true" />
          </a>
          <a href={personal.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <FaLinkedinIn size={20} aria-hidden="true" />
          </a>
          <a href={`mailto:${personal.email}`} aria-label={personal.email}>
            <Mail size={20} aria-hidden="true" />
          </a>
          <a href={resumePdf(lang)} download aria-label={t(lang).downloadCv} title={t(lang).downloadCv}>
            <FileDown size={20} aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.aside>
  )
}
