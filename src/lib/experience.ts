import type { Experience, Lang } from './cv'

const YEAR_MS = 1000 * 60 * 60 * 24 * 365.25

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
}

// Sin zona horaria: new Date('2022-01-01') en Buenos Aires da 31 de diciembre
const parseDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const startOf = (exp: Experience) => parseDate(exp.startDate).getTime()
const endOf = (exp: Experience) =>
  exp.endDate === 'current' ? Date.now() : parseDate(exp.endDate).getTime()

// Une períodos superpuestos para no contar dos veces un mismo tiempo
function coveredYears(experiences: Experience[]): number {
  const periods = experiences
    .map((exp) => [startOf(exp), endOf(exp)])
    .sort((a, b) => a[0] - b[0])

  let total = 0
  let currentEnd = -Infinity
  for (const [start, end] of periods) {
    if (end <= currentEnd) continue
    total += end - Math.max(start, currentEnd)
    currentEnd = end
  }
  return Math.round((total / YEAR_MS) * 10) / 10
}

export const totalYears = (experiences: Experience[]) => coveredYears(experiences)

export const techYears = (experiences: Experience[], tech: string) =>
  coveredYears(experiences.filter((exp) => exp.technologies.includes(tech)))

export interface TechSummary {
  name: string
  years: number
}

export function summarizeTech(experiences: Experience[]): TechSummary[] {
  const names = new Set(experiences.flatMap((exp) => exp.technologies))
  return [...names]
    .map((name) => ({ name, years: techYears(experiences, name) }))
    .sort((a, b) => b.years - a.years || a.name.localeCompare(b.name))
}

export function formatPeriod(exp: Experience, lang: Lang, presentLabel: string): string {
  const format = (date: Date) => `${MONTHS[lang][date.getMonth()]} ${date.getFullYear()}`
  const end = exp.endDate === 'current' ? presentLabel : format(parseDate(exp.endDate))
  return `${format(parseDate(exp.startDate))} - ${end}`
}

export interface TimelineScale {
  ticks: { year: number; left: number }[]
  position: (exp: Experience) => { left: number; width: number }
}

export function buildScale(experiences: Experience[]): TimelineScale {
  const firstYear = new Date(Math.min(...experiences.map(startOf))).getFullYear()
  const min = new Date(firstYear, 0, 1).getTime()
  const max = Date.now()
  const toPercent = (time: number) => ((time - min) / (max - min)) * 100

  const ticks = []
  for (let year = firstYear; new Date(year, 0, 1).getTime() < max; year += 2) {
    ticks.push({ year, left: toPercent(new Date(year, 0, 1).getTime()) })
  }

  return {
    ticks,
    position: (exp) => ({
      left: toPercent(startOf(exp)),
      width: toPercent(endOf(exp)) - toPercent(startOf(exp)),
    }),
  }
}
