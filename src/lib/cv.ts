import rawCv from '../data/cv.json'
import type { FlagCode } from '../components/Flag'

export type Lang = 'es' | 'en'
export type Localized = Record<Lang, string>

export interface Experience {
  id: string
  company: string
  logo: string
  position: Localized
  startDate: string
  endDate: string
  industry?: Localized
  companySize?: string
  description: Localized
  // Versión corta para el PDF
  summary: Localized
  technologies: string[]
}

export interface Project {
  id: string
  name: string
  logo: string
  description: Localized
  summary: Localized
  technologies: string[]
  links: { type: 'site' | 'code' | 'video'; url: string }[]
}

export interface Study {
  id: string
  title: Localized
  institution: Localized
  period: string
  // El PDF muestra solo la formación marcada, para no pasar de dos páginas
  showInPdf: boolean
  image: string
  description: Localized
  details: Localized
}

interface Cv {
  accent: string
  accentText: string
  personal: {
    fullName: string
    role: Localized
    location: string
    email: string
    github: string
    linkedin: string
    photo: string
    map: string
    contactMap: string
    biography: Localized
    lookingFor: Localized
    website: string
    // Un idioma nativo lleva level; uno aprendido, skills con value de 0 a 100 para las barras
    languages: {
      name: Localized
      flag: FlagCode
      level?: Localized
      skills?: { name: Localized; level: Localized; value: number }[]
    }[]
  }
  experiences: Experience[]
  projects: Project[]
  studies: Study[]
}

export const cv = rawCv as Cv

// Las rutas del JSON son relativas a public/
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

// Los genera npm run pdf
// El visual es para personas; el ATS, de una columna, para los portales que filtran CVs
export type ResumeKind = 'visual' | 'ats'
export const resumePdf = (lang: Lang, kind: ResumeKind = 'visual') =>
  asset(`cv-eric-bastida-${kind === 'ats' ? 'ats-' : ''}${lang}.pdf`)
