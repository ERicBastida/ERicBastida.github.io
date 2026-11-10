import { useMemo } from 'react'
import { motion, type Variants } from 'motion/react'
import { cv, type Lang } from '../lib/cv'
import { summarizeTech, totalYears } from '../lib/experience'
import { formatYears, t } from '../lib/i18n'
import { techIcon } from '../lib/techIcons'
import { Flag } from '../components/Flag'

const { personal, experiences } = cv

const iconVariants: Variants = {
  rest: { scale: 1 },
  active: { scale: 1.12 },
  tap: { scale: 0.94 },
}

const tooltipVariants: Variants = {
  rest: { opacity: 0, x: '-50%', y: 4 },
  active: { opacity: 1, x: '-50%', y: 0 },
}

const ease = { duration: 0.14, ease: 'easeOut' } as const

interface AboutProps {
  lang: Lang
  onSelectTech: (tech: string) => void
}

export function About({ lang, onSelectTech }: AboutProps) {
  const copy = t(lang)
  const tech = useMemo(() => summarizeTech(experiences), [])
  const maxYears = tech[0]?.years || 1

  return (
    <>
      <h1 className="section-title">{copy.about}</h1>
      <p className="section-meta">
        <span>{copy.yearsApprox(Math.ceil(totalYears(experiences)))}</span>
        <span>{personal.location}</span>
        <span>{personal.role[lang]}</span>
      </p>
      <p className="bio">{personal.biography[lang]}</p>

      <hr className="divider" />

      <h2 className="section-subtitle">{copy.lookingFor}</h2>
      <p className="bio">{personal.lookingFor[lang]}</p>

      <hr className="divider" />

      <h2 className="section-subtitle">{copy.stack}</h2>
      <p className="hint">{copy.stackHint}</p>
      {/* El tamaño de cada logo refleja los años de uso */}
      <ul className="stack">
        {tech.map(({ name, years }) => {
          const { icon: Icon, color } = techIcon(name)
          const yearsText = `${formatYears(years, lang)} ${copy.yearsUnit(years)}`
          const size = Math.round(20 + (years / maxYears) * 30)
          return (
            <li key={name}>
              <motion.button
                type="button"
                className="stack-item"
                aria-label={`${name}, ${yearsText}`}
                initial="rest"
                animate="rest"
                whileHover="active"
                whileFocus="active"
                whileTap="tap"
                onClick={() => onSelectTech(name)}
              >
                <motion.span className="stack-icon" style={{ color }} variants={iconVariants} transition={ease}>
                  <Icon size={size} aria-hidden="true" />
                </motion.span>
                <motion.span className="stack-tooltip" variants={tooltipVariants} transition={ease} aria-hidden="true">
                  <strong>{name}</strong>
                  <span>{yearsText}</span>
                </motion.span>
                {/* Sin mouse no hay tooltip: el nombre queda siempre visible */}
                <span className="stack-caption" aria-hidden="true">
                  {name}
                </span>
              </motion.button>
            </li>
          )
        })}
      </ul>

      <hr className="divider" />

      <h2 className="section-subtitle">{copy.languages}</h2>
      <ul className="languages">
        {personal.languages.map(({ name, flag, level, skills }) => (
          <li key={name.en}>
            <span className="language-name">
              <Flag code={flag} className="language-flag" />
              <strong>{name[lang]}</strong>
              {level && <span className="language-native">{level[lang]}</span>}
            </span>
            {skills && (
              <ul className="language-skills">
                {skills.map((skill) => (
                  <li key={skill.name.en}>
                    <span>{skill.name[lang]}</span>
                    <span className="language-track" aria-hidden="true">
                      <motion.span
                        className="language-bar"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: skill.value / 100 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </span>
                    <span className="language-level">{skill.level[lang]}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
