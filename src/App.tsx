import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring } from 'motion/react'
import { asset, cv, type Lang } from './lib/cv'
import { Rail, SECTIONS, type SectionId } from './components/Rail'
import { Portrait } from './components/Portrait'
import { About } from './sections/About'
import { ExperienceSection } from './sections/Experience'
import { Projects } from './sections/Projects'
import { Studies } from './sections/Studies'
import { Contact } from './sections/Contact'

const read = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Sin almacenamiento disponible la preferencia dura solo esta visita
  }
}

const sectionFromHash = (): SectionId => {
  const hash = window.location.hash.slice(1) as SectionId
  return SECTIONS.some((section) => section.id === hash) ? hash : 'about'
}

const initialLang = (): Lang => {
  const saved = read('lang')
  if (saved === 'es' || saved === 'en') return saved
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}

const panelVariants = {
  enter: (direction: number) => ({ opacity: 0, y: 28 * direction }),
  center: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } },
  exit: (direction: number) => ({
    opacity: 0,
    y: -20 * direction,
    transition: { duration: 0.16, ease: 'easeIn' as const },
  }),
}

export default function App() {
  const [section, setSection] = useState<SectionId>(sectionFromHash)
  const [direction, setDirection] = useState(1)
  const [lang, setLang] = useState<Lang>(initialLang)
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const panelRef = useRef<HTMLElement>(null)

  // El mapa de fondo acompaña apenas al puntero
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const mapX = useSpring(pointerX, { stiffness: 40, damping: 20 })
  const mapY = useSpring(pointerY, { stiffness: 40, damping: 20 })

  useEffect(() => {
    document.documentElement.lang = lang
    write('lang', lang)
  }, [lang])

  useEffect(() => {
    const onPop = () => setSection(sectionFromHash())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goTo = (next: SectionId) => {
    if (next === section) return
    const order = SECTIONS.map((item) => item.id)
    setDirection(order.indexOf(next) > order.indexOf(section) ? 1 : -1)
    setSection(next)
    window.history.pushState(null, '', `#${next}`)
    panelRef.current?.scrollTo({ top: 0 })
    if (window.matchMedia('(max-width: 900px)').matches && panelRef.current) {
      window.scrollTo({ top: panelRef.current.offsetTop })
    }
  }

  const showTech = (tech: string) => {
    setSelectedTech([tech])
    goTo('experience')
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    pointerX.set((event.clientX / window.innerWidth - 0.5) * -24)
    pointerY.set((event.clientY / window.innerHeight - 0.5) * -24)
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="page" onPointerMove={handlePointerMove}>
        <motion.div
          className="map"
          aria-hidden="true"
          style={{ backgroundImage: `url(${asset(cv.personal.map)})`, x: mapX, y: mapY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
        />

        <div className="card">
          <Rail active={section} onSelect={goTo} lang={lang} onLang={setLang} />
          <Portrait lang={lang} onLang={setLang} />

          <motion.main
            ref={panelRef}
            className="panel"
            layoutScroll
            initial={{ opacity: 0, x: -48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={section}
                className="panel-content"
                custom={direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {section === 'about' && <About lang={lang} onSelectTech={showTech} />}
                {section === 'experience' && (
                  <ExperienceSection
                    lang={lang}
                    selected={selectedTech}
                    onChange={setSelectedTech}
                  />
                )}
                {section === 'projects' && <Projects lang={lang} />}
                {section === 'studies' && <Studies lang={lang} />}
                {section === 'contact' && <Contact lang={lang} />}
              </motion.div>
            </AnimatePresence>
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  )
}
