import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Globe, Mail, MapPin } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import QRCode from 'qrcode'
import { asset, cv, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'
import { formatPeriod, summarizeTech, totalYears } from '../lib/experience'
import { Flag } from '../components/Flag'

const { personal } = cv
const STACK_SIZE = 10
const TAGS = 6
const PDF_TEXT = {
  es: {
    years: (years: number) => `${years} ${years === 1 ? 'año' : 'años'} de experiencia`,
    education: 'Formación',
    qrTitle: 'Versión actualizada',
    qrHint: 'Escaneá el código para ver mi CV siempre al día.',
  },
  en: {
    years: (years: number) => `${years} ${years === 1 ? 'year' : 'years'} of experience`,
    education: 'Education',
    qrTitle: 'Latest version',
    qrHint: 'Scan the code to see my always up-to-date CV.',
  },
}

interface Block {
  key: string
  node: ReactNode
  // Página mínima donde puede ir el bloque (0 es la primera)
  minPage?: number
}

const linkLabel = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

function QrCode({ url }: { url: string }) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: 'M' })
  let path = ''
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (modules.get(row, col)) path += `M${col} ${row}h1v1h-1z`
    }
  }
  return (
    <svg className="r-qr-code" viewBox={`0 0 ${modules.size} ${modules.size}`} aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  )
}

// Reparte los bloques en páginas sin cortar ninguno: cada uno va entero donde entra
function paginate(column: HTMLElement | null, blocks: Block[], firstCapacity: number, capacity: number): number[] {
  if (!column) return []
  const items = [...column.children] as HTMLElement[]
  const pageOf: number[] = []
  let page = 0
  let pageTop = 0
  items.forEach((item, index) => {
    const bottom = item.offsetTop + item.offsetHeight
    const limit = page === 0 ? firstCapacity : capacity
    const minPage = blocks[index].minPage ?? 0
    if (minPage > page) {
      page = minPage
      pageTop = item.offsetTop
    } else if (index > 0 && bottom - pageTop > limit) {
      page++
      pageTop = item.offsetTop
    }
    pageOf.push(page)
  })
  return pageOf
}

const pairs = <T,>(items: T[]) =>
  Array.from({ length: Math.ceil(items.length / 2) }, (_, index) => items.slice(index * 2, index * 2 + 2))

const Tags = ({ items }: { items: string[] }) => (
  <ul className="r-tags">
    {items.slice(0, TAGS).map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)

export function Resume({ lang }: { lang: Lang }) {
  const copy = t(lang)
  const text = PDF_TEXT[lang]
  const years = Math.ceil(totalYears(cv.experiences))
  const stack = summarizeTech(cv.experiences).slice(0, STACK_SIZE)
  const maxYears = stack[0]?.years ?? 1
  const formatTechYears = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 })

  const heading = (title: string) => <h2 className="r-heading">{title}</h2>

  const mainBlocks: Block[] = [
    {
      key: 'about',
      node: (
        <>
          {heading(copy.about)}
          <div className="r-card">
            <p className="r-lead">{text.years(years)}</p>
            <p>{personal.biography[lang]}</p>
          </div>
        </>
      ),
    },
    {
      key: 'looking',
      node: (
        <>
          {heading(copy.lookingFor)}
          <div className="r-card">
            <p>{personal.lookingFor[lang]}</p>
          </div>
        </>
      ),
    },
    ...cv.experiences.map((exp, index) => ({
      key: exp.id,
      node: (
        <>
          {index === 0 && heading(copy.experience)}
          <article className="r-card r-job">
            <img className="r-logo" src={asset(exp.logo)} alt="" />
            <div>
              <div className="r-card-head">
                <h3>{exp.company}</h3>
                <span className="r-period">{formatPeriod(exp, lang, copy.present)}</span>
              </div>
              <p className="r-position">
                {exp.position[lang]}
                {exp.industry && <span className="r-industry"> / {exp.industry[lang]}</span>}
              </p>
              <p>{exp.summary[lang]}</p>
              <Tags items={exp.technologies} />
            </div>
          </article>
        </>
      ),
    })),
    ...pairs(cv.projects).map((row, index) => ({
      key: `projects-${index}`,
      node: (
        <>
          {index === 0 && heading(copy.projects)}
          <div className="r-grid">
            {row.map((project) => (
              <article key={project.id} className="r-card r-project">
                <h3>{project.name}</h3>
                {project.links[0] && (
                  <a className="r-link" href={project.links[0].url}>
                    {linkLabel(project.links[0].url)}
                  </a>
                )}
                <p>{project.summary[lang]}</p>
                <Tags items={project.technologies} />
              </article>
            ))}
          </div>
        </>
      ),
    })),
  ]

  const sideBlocks: Block[] = [
    {
      key: 'contact',
      node: (
        <div className="r-side-card">
          <h2 className="r-side-heading">{copy.contact}</h2>
          <ul className="r-contact">
            <li>
              <Mail size={13} aria-hidden="true" />
              <a href={`mailto:${personal.email}`}>{personal.email}</a>
            </li>
            <li>
              <Globe size={13} aria-hidden="true" />
              <a href={personal.website}>{linkLabel(personal.website)}</a>
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
        </div>
      ),
    },
    {
      key: 'stack',
      node: (
        <div className="r-side-card">
          <h2 className="r-side-heading">{copy.stack}</h2>
          <ul className="r-bars">
            {stack.map(({ name, years: techYears }) => (
              <li key={name}>
                <span>{name}</span>
                <span className="r-bar-value">
                  {formatTechYears.format(techYears)} {copy.yearsShort(techYears)}
                </span>
                <span className="r-track">
                  <span className="r-bar" style={{ width: `${(techYears / maxYears) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      key: 'languages',
      node: (
        <div className="r-side-card">
          <h2 className="r-side-heading">{copy.languages}</h2>
          <div className="r-languages">
            {personal.languages.map((language) => (
              <div key={language.name.en}>
                <h3>
                  <Flag code={language.flag} className="r-flag" />
                  {language.name[lang]}
                  {language.level && <span className="r-bar-value">{language.level[lang]}</span>}
                </h3>
                {language.skills && (
                  <ul className="r-bars">
                    {language.skills.map((skill) => (
                      <li key={skill.name.en}>
                        <span>{skill.name[lang]}</span>
                        <span className="r-bar-value">{skill.level[lang]}</span>
                        <span className="r-track">
                          <span className="r-bar" style={{ width: `${skill.value}%` }} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    // Arranca la segunda página: lleva a la versión siempre actualizada
    {
      key: 'qr',
      minPage: 1,
      node: (
        <a className="r-side-card r-qr" href={personal.website}>
          <QrCode url={personal.website} />
          <strong>{text.qrTitle}</strong>
          <span>{text.qrHint}</span>
          <span className="r-qr-url">{linkLabel(personal.website)}</span>
        </a>
      ),
    },
    // Mismo formato que la experiencia, en la columna oscura que en la segunda página tiene lugar
    ...cv.studies
      .filter((study) => study.showInPdf)
      .map((study, index) => ({
        key: study.id,
        node: (
          <>
            {index === 0 && <h2 className="r-side-heading r-side-title">{text.education}</h2>}
            <article className="r-side-card r-study">
              <img className="r-logo" src={asset(study.image)} alt="" />
              <div>
                <h3>{study.title[lang]}</h3>
                <p className="r-study-place">{study.institution[lang]}</p>
                <p className="r-study-period">{study.period}</p>
              </div>
            </article>
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
      const pick = (selector: string) => root.querySelector<HTMLElement>(selector)!
      const main = pick('.r-main')
      const mainStyle = getComputedStyle(main)
      const mainCapacity = main.clientHeight - parseFloat(mainStyle.paddingTop) - parseFloat(mainStyle.paddingBottom)
      const side = pick('.r-side')
      const sideStyle = getComputedStyle(side)
      const sideFull = side.clientHeight - 2 * parseFloat(sideStyle.paddingBottom)
      const sideFirst = pick('.r-side .r-column')
      setLayout({
        main: paginate(pick('.r-main .r-column'), mainBlocks, mainCapacity, mainCapacity),
        side: paginate(sideFirst, sideBlocks, sideFirst.clientHeight, sideFull),
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

  const page = (index: number, side: Block[], main: Block[]) => (
    <section key={index} className="r-page">
      <aside className={index === 0 ? 'r-side r-side-first' : 'r-side'}>
        {index === 0 && photo}
        <div className="r-column">
          {side.map((block) => (
            <div key={block.key} className="r-block">
              {block.node}
            </div>
          ))}
        </div>
      </aside>
      <main className="r-main">
        <div className="r-column">
          {main.map((block) => (
            <div key={block.key} className="r-block">
              {block.node}
            </div>
          ))}
        </div>
      </main>
    </section>
  )

  if (!layout) {
    return (
      <div ref={measureRef} className="r-measure">
        {page(0, sideBlocks, mainBlocks)}
      </div>
    )
  }

  const pageCount = Math.max(...layout.main, ...layout.side) + 1
  return (
    <>
      {Array.from({ length: pageCount }, (_, index) =>
        page(
          index,
          sideBlocks.filter((_, block) => layout.side[block] === index),
          mainBlocks.filter((_, block) => layout.main[block] === index),
        ),
      )}
    </>
  )
}
