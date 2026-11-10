import type { Lang } from './cv'

export type RecruiterField = 'name' | 'company' | 'role' | 'offer'

// Plantilla del correo: texto fijo intercalado con los espacios a completar
type RecruiterPart =
  | { text: string; optional?: true }
  | { field: RecruiterField; label: string; placeholder: string }

// Singular solo si, redondeado como se muestra, da exactamente 1
const isOne = (years: number) => Math.round(years * 10) / 10 === 1

const strings = {
  es: {
    nav: { about: 'Sobre mí', experience: 'Experiencia', projects: 'Proyectos', studies: 'Estudios', contact: 'Contacto' },
    about: 'Sobre mí',
    experience: 'Experiencia',
    projects: 'Proyectos',
    projectsIntro: 'Lo que construyo por mi cuenta para aprender y resolver problemas reales.',
    projectLinks: { site: 'Ver sitio', code: 'Ver código', video: 'Ver video' },
    studies: 'Estudios',
    contact: 'Contacto',
    lookingFor: 'Qué busco',
    languages: 'Idiomas',
    stack: 'Mi stack',
    stackHint: 'Elegí una tecnología para ver dónde la usé.',
    yearsApprox: (years: number) => `Aprox. ${years} ${isOne(years) ? 'año' : 'años'}`,
    yearsLabel: (years: number) => `${isOne(years) ? 'año' : 'años'} de experiencia`,
    yearsUnit: (years: number): string => (isOne(years) ? 'año' : 'años'),
    yearsShort: (years: number): string => (isOne(years) ? 'año' : 'años'),
    present: 'Presente',
    filter: 'Filtrar por tecnología',
    showAll: (count: number) => `Ver todas (${count})`,
    showLess: 'Ver menos',
    clear: 'Limpiar filtros',
    employees: 'empleados',
    back: 'Volver a estudios',
    previous: 'Anterior',
    next: 'Siguiente',
    of: 'de',
    contactIntro: 'Completá los espacios y el correo se abre con el mensaje ya escrito.',
    copyEmail: 'Copiar correo',
    copyMessage: 'Copiar mensaje',
    copied: 'Copiado',
    openMail: 'Enviar correo',
    downloadCv: 'Descargar CV',
    downloadIntro: 'Elegí el formato según a dónde va.',
    resumes: {
      visual: { title: 'Diseño visual', hint: 'Para mandar a una persona' },
      ats: { title: 'Versión ATS', hint: 'Texto simple para portales de empleo' },
    },
    mailSubject: (role: string, company: string) => `Búsqueda de ${role} en ${company}`,
    recruiterMessage: [
      { text: 'Hola Eric! Soy ' },
      { field: 'name', label: 'Tu nombre', placeholder: 'tu nombre' },
      { text: ', de ' },
      { field: 'company', label: 'Tu empresa', placeholder: 'tu empresa' },
      { text: '. Vi tu CV y creo que hay muy buen match con nuestra búsqueda de ' },
      { field: 'role', label: 'Qué están buscando', placeholder: 'puesto y tecnologías' },
      { text: '. ' },
      { optional: true, text: 'La propuesta es ' },
      { field: 'offer', label: 'Condiciones de la propuesta, opcional', placeholder: 'condiciones (opcional)' },
      { optional: true, text: '. ' },
      { text: '¿Te interesa que te cuente más?' },
    ] as RecruiterPart[],
    switchLang: 'Cambiar a inglés',
    sections: 'Secciones',
  },
  en: {
    nav: { about: 'About me', experience: 'Experience', projects: 'Projects', studies: 'Studies', contact: 'Contact' },
    about: 'About me',
    experience: 'Experience',
    projects: 'Projects',
    projectsIntro: 'What I build on my own to learn and solve real problems.',
    projectLinks: { site: 'View site', code: 'View code', video: 'Watch video' },
    studies: 'Studies',
    contact: 'Contact',
    lookingFor: 'What I am looking for',
    languages: 'Languages',
    stack: 'My stack',
    stackHint: 'Pick a technology to see where I used it.',
    yearsApprox: (years: number) => `About ${years} ${isOne(years) ? 'year' : 'years'}`,
    yearsLabel: (years: number) => `${isOne(years) ? 'year' : 'years'} of experience`,
    yearsUnit: (years: number): string => (isOne(years) ? 'year' : 'years'),
    yearsShort: (years: number): string => (isOne(years) ? 'yr' : 'yrs'),
    present: 'Present',
    filter: 'Filter by technology',
    showAll: (count: number) => `Show all (${count})`,
    showLess: 'Show less',
    clear: 'Clear filters',
    employees: 'employees',
    back: 'Back to studies',
    previous: 'Previous',
    next: 'Next',
    of: 'of',
    contactIntro: 'Fill in the blanks and your email opens with the message already written.',
    copyEmail: 'Copy email',
    copyMessage: 'Copy message',
    copied: 'Copied',
    openMail: 'Send email',
    downloadCv: 'Download CV',
    downloadIntro: 'Pick the format for where it is going.',
    resumes: {
      visual: { title: 'Visual design', hint: 'To send to a person' },
      ats: { title: 'ATS version', hint: 'Plain text for job portals' },
    },
    mailSubject: (role: string, company: string) => `${role} opening at ${company}`,
    recruiterMessage: [
      { text: 'Hi Eric! I am ' },
      { field: 'name', label: 'Your name', placeholder: 'your name' },
      { text: ', from ' },
      { field: 'company', label: 'Your company', placeholder: 'your company' },
      { text: '. I saw your CV and I think you could be a great match for our ' },
      { field: 'role', label: 'What you are looking for', placeholder: 'role and technologies' },
      { text: ' opening. ' },
      { optional: true, text: 'The offer is ' },
      { field: 'offer', label: 'Offer conditions, optional', placeholder: 'conditions (optional)' },
      { optional: true, text: '. ' },
      { text: 'Would you like to hear more?' },
    ] as RecruiterPart[],
    switchLang: 'Switch to Spanish',
    sections: 'Sections',
  },
} satisfies Record<Lang, unknown>

export type Strings = (typeof strings)['es']
export const t = (lang: Lang): Strings => strings[lang]

export const formatYears = (years: number, lang: Lang) =>
  new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(years)
