import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { asset, cv, type Experience, type Lang } from '../lib/cv'
import { buildScale, formatPeriod, summarizeTech, techYears, totalYears } from '../lib/experience'
import { formatYears, t } from '../lib/i18n'

const { experiences } = cv
const VISIBLE_TECH = 10

function CountUp({ value, lang }: { value: number; lang: Lang }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced ? value : 0)
  const latest = useRef(shown)

  useEffect(() => {
    if (reduced) {
      setShown(value)
      return
    }
    const controls = animate(latest.current, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (current) => {
        latest.current = current
        setShown(current)
      },
    })
    return () => controls.stop()
  }, [value, reduced])

  return <>{formatYears(Math.round(shown * 10) / 10, lang)}</>
}

interface ExperienceSectionProps {
  lang: Lang
  selected: string[]
  onChange: (selected: string[]) => void
}

export function ExperienceSection({ lang, selected, onChange }: ExperienceSectionProps) {
  const copy = t(lang)
  const [openId, setOpenId] = useState<string | null>(experiences[0]?.id ?? null)
  const [showAll, setShowAll] = useState(false)
  const tech = useMemo(() => summarizeTech(experiences), [])
  const scale = useMemo(() => buildScale(experiences), [])

  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name])

  const matches = (exp: Experience) =>
    selected.length === 0 || exp.technologies.some((item) => selected.includes(item))

  const visibleJobs = experiences.filter(matches)
  // Lo seleccionado sigue a la vista aunque la lista esté contraída
  const visibleTech = showAll
    ? tech
    : tech.filter((item, index) => index < VISIBLE_TECH || selected.includes(item.name))
  const singleTech = selected.length === 1 ? selected[0] : null
  const shownYears = singleTech ? techYears(experiences, singleTech) : totalYears(experiences)

  return (
    <>
      <h1 className="section-title">{copy.experience}</h1>

      <p className="years">
        <span className="years-number">
          <CountUp value={shownYears} lang={lang} />
        </span>
        <span className="years-label">
          {copy.yearsLabel(shownYears)}
          {singleTech ? ` ${lang === 'es' ? 'con' : 'with'} ${singleTech}` : ''}
        </span>
      </p>

      <div className="filter" role="group" aria-label={copy.filter}>
        <p className="hint">{copy.filter}</p>
        <motion.ul className="chips" layout="position">
          {visibleTech.map(({ name, years }) => (
            <motion.li key={name} layout="position">
              <button
                type="button"
                className="chip"
                aria-pressed={selected.includes(name)}
                onClick={() => toggle(name)}
              >
                {name}
                <span className="chip-years">
                  {formatYears(years, lang)} {copy.yearsShort(years)}
                </span>
              </button>
            </motion.li>
          ))}
        </motion.ul>
        <div className="filter-actions">
          {tech.length > VISIBLE_TECH && (
            <button type="button" className="link-button" onClick={() => setShowAll(!showAll)}>
              {showAll ? copy.showLess : copy.showAll(tech.length)}
            </button>
          )}
          {selected.length > 0 && (
            <button type="button" className="link-button" onClick={() => onChange([])}>
              {copy.clear}
            </button>
          )}
        </div>
      </div>

      <div className="timeline-axis" aria-hidden="true">
        {scale.ticks.map(({ year, left }) => (
          <span key={year} style={{ left: `${left}%` }}>
            {year}
          </span>
        ))}
      </div>

      <ul className="jobs">
        <AnimatePresence initial={false} mode="popLayout">
          {visibleJobs.map((exp) => {
            const isOpen = openId === exp.id
            const { left, width } = scale.position(exp)
            return (
              <motion.li
                key={exp.id}
                className="job"
                layout="position"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              >
                <button
                  type="button"
                  className="job-header"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : exp.id)}
                >
                  <img className="job-logo" src={asset(exp.logo)} alt="" loading="lazy" />
                  <span className="job-title">
                    <strong>{exp.company}</strong>
                    <span>{exp.position[lang]}</span>
                  </span>
                  <span className="job-period">{formatPeriod(exp, lang, copy.present)}</span>
                  <motion.span
                    className="job-chevron"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown size={18} aria-hidden="true" />
                  </motion.span>
                </button>

                <span className="job-track" aria-hidden="true">
                  <motion.span
                    className="job-bar"
                    style={{
                      left: `min(${left}%, calc(100% - 6px))`,
                      width: `${width}%`,
                      transformOrigin: 'left',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="job-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="job-body-inner">
                        {(exp.industry || exp.companySize) && (
                          <p className="job-meta">
                            {exp.industry && <span>{exp.industry[lang]}</span>}
                            {exp.companySize && (
                              <span>
                                {exp.companySize} {copy.employees}
                              </span>
                            )}
                          </p>
                        )}
                        <p>{exp.description[lang]}</p>
                        <ul className="chips">
                          {exp.technologies.map((name) => (
                            <li key={name}>
                              <button
                                type="button"
                                className="chip chip-small"
                                aria-pressed={selected.includes(name)}
                                onClick={() => toggle(name)}
                              >
                                {name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </>
  )
}
