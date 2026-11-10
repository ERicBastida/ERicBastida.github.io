import type { Localized } from '../lib/cv'

// Categorías del CV ATS. Una tecnología que no figura acá no aparece en esa lista
export const SKILL_GROUPS: { name: Localized; items: string[] }[] = [
  {
    name: { es: 'Lenguajes', en: 'Languages' },
    items: ['JavaScript', 'TypeScript', 'Java', 'C#', 'Python', 'PHP', 'Go', 'C++', 'SQL'],
  },
  {
    name: { es: 'Frontend y mobile', en: 'Frontend and mobile' },
    items: ['React', 'Next.js', 'Vue.js', 'Angular', 'jQuery', 'HTML', 'CSS', 'Razor', 'Flutter', 'React Native'],
  },
  {
    name: { es: 'Backend y APIs', en: 'Backend and APIs' },
    items: ['Spring Boot', 'Node.js', '.NET', 'Laravel', 'Django', 'GraphQL', 'Web APIs'],
  },
  {
    name: { es: 'Bases de datos', en: 'Databases' },
    items: ['MySQL', 'SQLite', 'Firebase'],
  },
  {
    name: { es: 'Cloud y herramientas', en: 'Cloud and tools' },
    items: ['AWS', 'Fly.io', 'Git', 'GitHub Actions', 'TFS', 'SVN'],
  },
  {
    name: { es: 'Inteligencia artificial', en: 'Artificial intelligence' },
    items: ['AI', 'Claude API', 'MCP'],
  },
]

// Detalle que el ATS agrega entre paréntesis, para que también encuentre cada servicio
export const SKILL_DETAILS: Record<string, string> = {
  AWS: 'EC2, S3, SQS, RDS, ElastiCache, Secrets Manager, CodePipeline',
}
