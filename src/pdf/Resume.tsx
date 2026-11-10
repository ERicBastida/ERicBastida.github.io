import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Mail, MapPin } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { asset, cv, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'
import { formatPeriod, summarizeTech, totalYears } from '../lib/experience'

const { personal } = cv
const STACK_SIZE = 12
const PDF_TEXT = {
  es: { years: (years: string) => `${years} años de experiencia`, education: 'formación' },
  en: { years: (years: string) => `${years} years of experience`, education: 'education' },
}

interface Block {
  key: string
  node: ReactNode
}

const linkLabel = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '')

// Reparte los bloques en páginas sin cortar ninguno: cada uno va entero donde entra
function paginate(column: HTMLElement | null, firstCapacity: number, capacity: number): number[] {
  if (!column) return []
  const items = [...column.children] as HTMLElement[]
  const pageOf: number[] = []
  let page = 0
  let pageTop = 0
  items.forEach((item, index) => {
    const bottom = item.offsetTop + item.offsetHeight
    const limit = page === 0 ? firstCapacity : capacity
    if (index > 0 && bottom - pageTop > limit) {
      page++
      pageTop = item.offsetTop
    }
    pageOf.push(page)
  })
  return pageOf
}

export function Resume({ lang }: { lang: Lang }) {
  const copy = t(lang)
  const text = PDF_TEXT[lang]
  const years = new Intl.NumberFormat(lang, { maximumFractionDigits: 0 }).format(
    Math.ceil(totalYears(cv.experiences)),
  )
  const stack = summarizeTech(cv.experiences).slice(0, STACK_SIZE)
  const maxYears = stack[0]?.years ?? 1

  const heading = (title: string) => <h2 className="r-heading">{title}</h2>

  const mainBlocks: Block[] = [
    {
      key: 'about',
      node: (
        <>
          {heading(copy.about)}
          <p className="r-lead">{text.years(years)}</p>
          <p>{personal.biography[lang]}</p>
        </>
      ),
    },
    ...cv.experiences.map((exp, index) => ({
      key: exp.id,
      node: (
        <>
          {index === 0 && heading(copy.experience)}
          <article className="r-job">
            <img className="r-logo" src={asset(exp.logo)} alt="" />
            <div>
              <div className="r-job-head">
                <h3>{exp.company}</h3>
                <span className="r-period">{formatPeriod(exp, lang, copy.present)}</span>
              </div>
              <p className="r-position">
                {exp.position[lang]}
                {exp.industry && <span className="r-industry"> / {exp.industry[lang]}</span>}
              </p>
              <p>{exp.description[lang]}</p>
              <p className="r-tags">{exp.technologies.join('  /  ')}</p>
            </div>
          </article>
        </>
      ),
    })),
    ...cv.projects.map((project, index) => ({
      key: project.id,
      node: (
        <>
          {index === 0 && heading(copy.projects)}
          <article className="r-project">
            <div className="r-job-head">
              <h3>{project.name}</h3>
              {project.links[0] && (
                <a className="r-period" href={project.links[0].url}>
                  {linkLabel(project.links[0].url)}
                </a>
              )}
            </div>
            <p>{project.description[lang]}</p>
            <p className="r-tags">{project.technologies.join('  /  ')}</p>
          </article>
        </>
      ),
    })),
  ]

  const sideBlocks: Block[] = [
    {
      key: 'contact',
      node: (
        <>
          <h2 className="r-side-heading">{copy.contact}</h2>
          <ul className="r-contact">
            <li>
              <Mail size={13} aria-hidden="true" />
              <a href={`mailto:${personal.email}`}>{personal.email}</a>
            </li>
            <li>
              <FaLinkedinIn size={12} aria-hidden="true" />
              <a href={personal.linkedin}>{linkLabel(personal.linkedin)}</a>
            </li>
            <li>
              <FaGithub size={12} aria-hidden="true" />
              <a href={personal.github}>{linkLabel(personal.github)}</a>
            </li>
            <li>
              <MapPin size={13} aria-hidden="true" />
              <span>{personal.location}</span>
            </li>
          </ul>
        </>
      ),
    },
    {
      key: 'stack',
      node: (
        <>
          <h2 className="r-side-heading">{copy.stack}</h2>
          <ul className="r-stack">
            {stack.map(({ name, years: techYears }) => (
              <li key={name}>
                <span>{name}</span>
                <span className="r-stack-years">
                  {new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(techYears)} {copy.yearsShort}
                </span>
                <span className="r-track">
                  <span className="r-bar" style={{ width: `${(techYears / maxYears) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      key: 'languages',
      node: (
        <>
          <h2 className="r-side-heading">{copy.languages}</h2>
          <ul className="r-list">
            {personal.languages.map((language) => (
              <li key={language.name.en}>
                <strong>{language.name[lang]}</strong>
                <span>{language.level[lang]}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      key: 'looking',
      node: (
        <>
          <h2 className="r-side-heading">{copy.lookingFor}</h2>
          <p className="r-side-text">{personal.lookingFor[lang]}</p>
        </>
      ),
    },
    ...cv.studies.map((study, index) => ({
      key: study.id,
      node: (
        <>
          {index === 0 && <h2 className="r-side-heading">{text.education}</h2>}
          <div className="r-study">
            <strong>{study.title[lang]}</strong>
            <span>{study.institution[lang]}</span>
            <span className="r-study-period">{study.period}</span>
          </div>
        </>
      ),
    })),
  ]

  const measureRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<{ main: number[]; side: number[] } | null>(null)

  useLayoutEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      const root = measureRef.current
      if (cancelled || !root) return
      const pick = (selector: string) => root.querySelector<HTMLElement>(selector)
      const mainCapacity = pick('.r-main')!.clientHeight - 2 * parseFloat(getComputedStyle(pick('.r-main')!).paddingTop)
      const sideFirst = pick('.r-side .r-column')!
      const sideStyle = getComputedStyle(pick('.r-side')!)
      const sideFull = pick('.r-side')!.clientHeight - 2 * parseFloat(sideStyle.paddingBottom)
      setLayout({
        main: paginate(pick('.r-main .r-column'), mainCapacity, mainCapacity),
        side: paginate(sideFirst, sideFirst.clientHeight, sideFull),
      })
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Avisa a Chrome que ya puede imprimir
  useLayoutEffect(() => {
    if (layout) document.body.dataset.ready = 'true'
  }, [layout])

  const photo = (
    <div className="r-photo">
      <img src={asset(personal.photo)} alt="" />
      <div className="r-identity">
        <h1>{personal.fullName}</h1>
        <p>{personal.role[lang]}</p>
      </div>
    </div>
  )

  if (!layout) {
    return (
      <div ref={measureRef} className="r-measure">
        <section className="r-page">
          <aside className="r-side r-side-first">
            {photo}
            <div className="r-column">
              {sideBlocks.map((block) => (
                <div key={block.key}>{block.node}</div>
              ))}
            </div>
          </aside>
          <main className="r-main">
            <div className="r-column">
              {mainBlocks.map((block) => (
                <div key={block.key}>{block.node}</div>
              ))}
            </div>
          </main>
        </section>
      </div>
    )
  }

  const pageCount = Math.max(...layout.main, ...layout.side) + 1
  return (
    <>
      {Array.from({ length: pageCount }, (_, page) => (
        <section key={page} className="r-page">
          <aside className={page === 0 ? 'r-side r-side-first' : 'r-side'}>
            {page === 0 && photo}
            <div className="r-column">
              {sideBlocks
                .filter((_, index) => layout.side[index] === page)
                .map((block) => (
                  <div key={block.key}>{block.node}</div>
                ))}
            </div>
          </aside>
          <main className="r-main">
            <div className="r-column">
              {mainBlocks
                .filter((_, index) => layout.main[index] === page)
                .map((block) => (
                  <div key={block.key}>{block.node}</div>
                ))}
            </div>
          </main>
        </section>
      ))}
    </>
  )
}
