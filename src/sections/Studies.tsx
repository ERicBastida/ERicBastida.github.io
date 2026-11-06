import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { asset, cv, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'

const { studies } = cv
const spring = { type: 'spring', stiffness: 340, damping: 32 } as const

export function Studies({ lang }: { lang: Lang }) {
  const copy = t(lang)
  const [index, setIndex] = useState<number | null>(null)

  if (index !== null) {
    const study = studies[index]
    return (
      <article className="study-detail">
        <button type="button" className="link-button study-back" onClick={() => setIndex(null)}>
          <ArrowLeft size={16} aria-hidden="true" />
          {copy.back}
        </button>
        <motion.div className="study-logo study-logo-large" layoutId={`logo-${study.id}`} transition={spring}>
          <img src={asset(study.image)} alt="" />
        </motion.div>
        <motion.div key={study.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="study-detail-title">{study.title[lang]}</h1>
          <p className="section-meta">
            <span>{study.institution[lang]}</span>
            <span>{study.period}</span>
          </p>
          <p className="bio">{study.description[lang]}</p>
          <p className="bio">{study.details[lang]}</p>
        </motion.div>
        <div className="study-pager">
          <button
            type="button"
            className="link-button"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            {copy.previous}
          </button>
          <span className="hint">
            {index + 1} {copy.of} {studies.length}
          </span>
          <button
            type="button"
            className="link-button"
            disabled={index === studies.length - 1}
            onClick={() => setIndex(index + 1)}
          >
            {copy.next}
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </article>
    )
  }

  return (
    <>
      <h1 className="section-title">{copy.studies}</h1>
      <ul className="studies">
        {studies.map((study, position) => (
          <li key={study.id}>
            <button type="button" className="study" onClick={() => setIndex(position)}>
              <motion.div className="study-logo" layoutId={`logo-${study.id}`} transition={spring}>
                <img src={asset(study.image)} alt="" loading="lazy" />
              </motion.div>
              <span className="study-text">
                <strong>{study.title[lang]}</strong>
                <span>{study.institution[lang]}</span>
                <span className="study-period">{study.period}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
