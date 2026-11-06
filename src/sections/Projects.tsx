import { Bot, Cpu, ExternalLink, Plane, Syringe } from 'lucide-react'
import { asset, cv, type Lang } from '../lib/cv'
import { t } from '../lib/i18n'

// Los proyectos sin logo propio usan un ícono de lo que son
const PLACEHOLDERS: Record<string, typeof Bot> = {
  'turnos-vacunacion': Syringe,
  becopter: Plane,
  'autito-bluetooth': Cpu,
}

export function Projects({ lang }: { lang: Lang }) {
  const copy = t(lang)

  return (
    <>
      <h1 className="section-title">{copy.projects}</h1>
      <p className="bio">{copy.projectsIntro}</p>

      <ul className="projects">
        {cv.projects.map((project) => {
          const Placeholder = PLACEHOLDERS[project.id] ?? Bot
          return (
            <li key={project.id} className="project">
              {project.logo ? (
                <img className="job-logo" src={asset(project.logo)} alt="" />
              ) : (
                <span className="project-placeholder" aria-hidden="true">
                  <Placeholder size={22} strokeWidth={1.75} />
                </span>
              )}
              <div className="project-body">
                <h2 className="project-name">{project.name}</h2>
                <p>{project.description[lang]}</p>
                <ul className="project-tags">
                  {project.technologies.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
                {project.links.length > 0 && (
                  <div className="filter-actions">
                    {project.links.map(({ type, url }) => (
                      <a key={url} className="link-button" href={url} target="_blank" rel="noreferrer">
                        {copy.projectLinks[type]}
                        <ExternalLink size={14} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
