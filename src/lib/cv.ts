import rawCv from '../data/cv.json'

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
  technologies: string[]
}

export interface Project {
  id: string
  name: string
  logo: string
  description: Localized
  technologies: string[]
  links: { type: 'site' | 'code' | 'video'; url: string }[]
}

export interface Study {
  id: string
  title: Localized
  institution: Localized
  period: string
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
    languages: { name: Localized; level: Localized }[]
  }
  experiences: Experience[]
  projects: Project[]
  studies: Study[]
}

export const cv = rawCv as Cv

// Las rutas del JSON son relativas a public/
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

// Los genera npm run pdf
export const resumePdf = (lang: Lang) => asset(`cv-eric-bastida-${lang}.pdf`)
