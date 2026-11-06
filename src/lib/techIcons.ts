import type { IconType } from 'react-icons'
import { FaAws, FaJava } from 'react-icons/fa'
import {
  SiAngular,
  SiCplusplus,
  SiCss,
  SiDjango,
  SiDotnet,
  SiFirebase,
  SiFlutter,
  SiGit,
  SiGo,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiJquery,
  SiLaravel,
  SiMysql,
  SiNodedotjs,
  SiPhp,
  SiPython,
  SiReact,
  SiSharp,
  SiSpringboot,
  SiSqlite,
  SiSubversion,
  SiTypescript,
  SiVuedotjs,
} from 'react-icons/si'
import {
  TbApi,
  TbBrandAzure,
  TbBrandReactNative,
  TbCode,
  TbDatabase,
  TbSparkles,
  TbTerminal2,
  TbWorldWww,
} from 'react-icons/tb'

interface TechIcon {
  icon: IconType
  color: string
}

// Colores de cada marca, aclarados donde no se leían sobre el panel oscuro
const ICONS: Record<string, TechIcon> = {
  '.NET': { icon: SiDotnet, color: '#9b7bf0' },
  AI: { icon: TbSparkles, color: '#8f9bf0' },
  AWS: { icon: FaAws, color: '#ff9900' },
  Angular: { icon: SiAngular, color: '#ee4266' },
  'C#': { icon: SiSharp, color: '#c07fbb' },
  'C++': { icon: SiCplusplus, color: '#5b9bd5' },
  CSS: { icon: SiCss, color: '#4d9fe0' },
  Django: { icon: SiDjango, color: '#44b78b' },
  Firebase: { icon: SiFirebase, color: '#ffca28' },
  Flutter: { icon: SiFlutter, color: '#54c5f8' },
  Git: { icon: SiGit, color: '#f05032' },
  Go: { icon: SiGo, color: '#00add8' },
  GraphQL: { icon: SiGraphql, color: '#e535ab' },
  HTML: { icon: SiHtml5, color: '#e34f26' },
  JCL: { icon: TbTerminal2, color: '#a4a6aa' },
  Java: { icon: FaJava, color: '#f89820' },
  JavaScript: { icon: SiJavascript, color: '#f7df1e' },
  Laravel: { icon: SiLaravel, color: '#ff2d20' },
  MySQL: { icon: SiMysql, color: '#6fa8d0' },
  'Node.js': { icon: SiNodedotjs, color: '#6cc24a' },
  PHP: { icon: SiPhp, color: '#8f93d0' },
  Python: { icon: SiPython, color: '#ffd43b' },
  Razor: { icon: TbCode, color: '#9b7bf0' },
  React: { icon: SiReact, color: '#61dafb' },
  'React Native': { icon: TbBrandReactNative, color: '#61dafb' },
  SQL: { icon: TbDatabase, color: '#a4a6aa' },
  SQLite: { icon: SiSqlite, color: '#5aa9d6' },
  SVN: { icon: SiSubversion, color: '#809cc9' },
  'Spring Boot': { icon: SiSpringboot, color: '#6db33f' },
  TFS: { icon: TbBrandAzure, color: '#3a9be8' },
  TypeScript: { icon: SiTypescript, color: '#4d94d8' },
  'Vue.js': { icon: SiVuedotjs, color: '#4fc08d' },
  'Web APIs': { icon: TbApi, color: '#a4a6aa' },
  'Web Pages': { icon: TbWorldWww, color: '#a4a6aa' },
  jQuery: { icon: SiJquery, color: '#4fa3dc' },
}

// Una tecnología nueva en el JSON sin logo propio usa este
const FALLBACK: TechIcon = { icon: TbCode, color: '#a4a6aa' }

export const techIcon = (name: string) => ICONS[name] ?? FALLBACK
