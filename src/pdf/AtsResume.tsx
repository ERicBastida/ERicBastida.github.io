import { cv, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'
import { formatPeriod, summarizeTech, totalYears } from '../lib/experience'
import { SKILL_GROUPS } from './skills'

const { personal } = cv

const TEXT = {
  es: {
    summary: 'Resumen',
    skills: 'Tecnologías',
    education: 'Formación',
    tech: 'Tecnologías',
    ai: 'IA aplicada al desarrollo',
    years: (years: number) => `${years} ${years === 1 ? 'año' : 'años'} de experiencia`,
  },
  en: {
    summary: 'Summary',
    skills: 'Skills',
    education: 'Education',
    tech: 'Technologies',
    ai: 'AI-assisted development',
    years: (years: number) => `${years} ${years === 1 ? 'year' : 'years'} of experience`,
  },
}

const linkLabel = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

// Cada oración de la descripción pasa a ser una viñeta
const sentences = (text: string) =>
  text
    .split(/(?<=\.)\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

export function AtsResume({ lang }: { lang: Lang }) {
  const copy = t(lang)
  const text = TEXT[lang]
  const techName = (name: string) => (name === 'AI' ? text.ai : name)

  // Dentro de cada categoría, primero lo que más años se usó
  const usage = new Map(summarizeTech(cv.experiences).map(({ name, years }) => [name, years]))
  const inData = new Set([...cv.experiences, ...cv.projects].flatMap((item) => item.technologies))
  const groups = SKILL_GROUPS.map((group) => ({
    name: group.name[lang],
    items: group.items
      .filter((item) => inData.has(item))
      .sort((a, b) => (usage.get(b) ?? 0) - (usage.get(a) ?? 0)),
  })).filter((group) => group.items.length > 0)

  const languages = personal.languages
    .map((language) => {
      const level =
        language.level?.[lang] ??
        language.skills?.map((skill) => `${skill.name[lang]}: ${skill.level[lang].toLowerCase()}`).join(', ')
      return `${language.name[lang]} (${level})`
    })
    .join(' | ')

  return (
    <main className="a-page">
      <header className="a-header">
        <h1>{personal.fullName}</h1>
        <p className="a-role">
          {personal.role[lang]} | {text.years(Math.ceil(totalYears(cv.experiences)))}
        </p>
        <p className="a-contact">
          {personal.location} | <a href={`mailto:${personal.email}`}>{personal.email}</a> |{' '}
          <a href={personal.linkedin}>{linkLabel(personal.linkedin)}</a> |{' '}
          <a href={personal.github}>{linkLabel(personal.github)}</a> |{' '}
          <a href={personal.website}>{linkLabel(personal.website)}</a>
        </p>
      </header>

      <section>
        <h2>{text.summary}</h2>
        <p>{personal.biography[lang]}</p>
      </section>

      <section>
        <h2>{text.skills}</h2>
        <ul className="a-skills">
          {groups.map((group) => (
            <li key={group.name}>
              <strong>{group.name}:</strong> {group.items.map(techName).join(', ')}
            </li>
          ))}
          <li>
            <strong>{copy.languages}:</strong> {languages}
          </li>
        </ul>
      </section>

      <section>
        <h2>{copy.experience}</h2>
        {cv.experiences.map((exp) => (
          <article key={exp.id} className="a-entry">
            <div className="a-entry-head">
              <h3>
                {exp.position[lang]}, {exp.company}
              </h3>
              <span>{formatPeriod(exp, lang, copy.present)}</span>
            </div>
            {exp.industry && <p className="a-meta">{exp.industry[lang]}</p>}
            <ul className="a-bullets">
              {sentences(exp.description[lang]).map((sentence) => (
                <li key={sentence}>{sentence}</li>
              ))}
            </ul>
            <p className="a-meta">
              {text.tech}: {exp.technologies.map(techName).join(', ')}
            </p>
          </article>
        ))}
      </section>

      <section>
        <h2>{copy.projects}</h2>
        {cv.projects.map((project) => (
          <article key={project.id} className="a-entry">
            <div className="a-entry-head">
              <h3>{project.name}</h3>
              {project.links[0] && <a href={project.links[0].url}>{linkLabel(project.links[0].url)}</a>}
            </div>
            <p>
              {project.summary[lang]} <span className="a-meta">{project.technologies.join(', ')}</span>
            </p>
          </article>
        ))}
      </section>

      <section>
        <h2>{text.education}</h2>
        {cv.studies
          .filter((study) => study.showInPdf)
          .map((study) => (
            <article key={study.id} className="a-entry">
              <div className="a-entry-head">
                <h3>
                  {study.title[lang]}, {study.institution[lang]}
                </h3>
                <span>{study.period}</span>
              </div>
            </article>
          ))}
      </section>
    </main>
  )
}
