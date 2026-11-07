import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { asset, cv } from '../lib/cv'
import { bidirectionalDijkstra, parseRoads, type RoadGraph } from '../lib/roads'

const MAP_WIDTH = 2400
const MAP_HEIGHT = 1350
const STREET_GLOW = '#5468ff'
const LINE = '#6f81ff'
const ROUTE = '#e4e8ff'
const EXPLORE_MS = 9000
const ROUTE_MS = 1400
const HOLD_MS = 3500
const FADE_MS = 1200

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

// Elige dos puntos a la vista y lejos entre sí, fuera de la tarjeta si se puede
function pickEndpoints(graph: RoadGraph, toScreen: (n: number) => [number, number], width: number, height: number) {
  const card = document.querySelector('.card')?.getBoundingClientRect()
  const inView: number[] = []
  const outside: number[] = []
  for (let n = 0; n < graph.size; n++) {
    const [x, y] = toScreen(n)
    if (x < 16 || y < 16 || x > width - 16 || y > height - 16) continue
    inView.push(n)
    if (!card || x < card.left || x > card.right || y < card.top || y > card.bottom) outside.push(n)
  }
  const pool = outside.length > 1 ? outside : inView
  const random = () => pool[Math.floor(Math.random() * pool.length)]

  const start = random()
  let goal = random()
  const [sx, sy] = toScreen(start)
  let farthest = -1
  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = random()
    const [cx, cy] = toScreen(candidate)
    const distance = Math.hypot(cx - sx, cy - sy)
    if (distance > farthest) {
      farthest = distance
      goal = candidate
    }
    if (distance > width * 0.55) break
  }
  return [start, goal]
}

export function RouteSearch() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const desktop = window.matchMedia('(min-width: 901px)')
    let frame = 0
    let timer = 0
    let cancelled = false
    let graph: RoadGraph | null = null
    let map: HTMLImageElement | null = null

    const stop = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }

    const run = () => {
      stop()
      if (!graph || !map || !desktop.matches) return
      const roads = graph

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.opacity = '1'

      const scale = Math.max(width / MAP_WIDTH, height / MAP_HEIGHT)
      const originX = (width - MAP_WIDTH * scale) / 2
      const originY = (height - MAP_HEIGHT * scale) / 2
      const toScreen = (n: number): [number, number] => [
        roads.x[n] * scale + originX,
        roads.y[n] * scale + originY,
      ]

      // Copia del mapa teñida: al pintar con ella se encienden las calles reales
      const tinted = document.createElement('canvas')
      tinted.width = canvas.width
      tinted.height = canvas.height
      const tint = tinted.getContext('2d')!
      tint.globalCompositeOperation = 'lighter'
      for (let pass = 0; pass < 4; pass++) {
        tint.drawImage(map, originX * dpr, originY * dpr, MAP_WIDTH * scale * dpr, MAP_HEIGHT * scale * dpr)
      }
      tint.globalCompositeOperation = 'multiply'
      tint.fillStyle = STREET_GLOW
      tint.fillRect(0, 0, tinted.width, tinted.height)
      const streets = context.createPattern(tinted, 'no-repeat')!

      const stroke = (from: number, to: number, data: Uint32Array, major: number, width: number) => {
        context.lineWidth = width * dpr
        context.beginPath()
        for (let i = from; i < to; i++) {
          if (major >= 0 && data[i * 3 + 2] !== major) continue
          const [ax, ay] = toScreen(data[i * 3])
          const [bx, by] = toScreen(data[i * 3 + 1])
          context.moveTo(ax * dpr, ay * dpr)
          context.lineTo(bx * dpr, by * dpr)
        }
        context.stroke()
      }

      const paintExplored = (from: number, to: number, data: Uint32Array) => {
        if (from >= to) return
        context.lineCap = 'round'
        context.globalCompositeOperation = 'source-over'
        context.strokeStyle = streets
        stroke(from, to, data, -1, 22)

        context.globalCompositeOperation = 'lighter'
        context.strokeStyle = 'rgb(84 104 255 / 0.2)'
        stroke(from, to, data, 1, 5)
        context.strokeStyle = LINE
        stroke(from, to, data, 1, 1.5)
        context.strokeStyle = 'rgb(111 129 255 / 0.55)'
        stroke(from, to, data, 0, 0.8)
        context.globalCompositeOperation = 'source-over'
      }

      const paintRoute = (path: number[], from: number, to: number) => {
        if (from >= to) return
        context.lineCap = 'round'
        context.lineJoin = 'round'
        for (const [color, lineWidth] of [['rgb(84 104 255 / 0.5)', 7], [ROUTE, 2]] as const) {
          context.strokeStyle = color
          context.lineWidth = lineWidth * dpr
          context.beginPath()
          for (let i = from; i <= to; i++) {
            const [x, y] = toScreen(path[i])
            if (i === from) context.moveTo(x * dpr, y * dpr)
            else context.lineTo(x * dpr, y * dpr)
          }
          context.stroke()
        }
      }

      const paintEndpoints = (nodes: number[]) => {
        for (const node of nodes) {
          const [x, y] = toScreen(node)
          context.beginPath()
          context.arc(x * dpr, y * dpr, 8 * dpr, 0, Math.PI * 2)
          context.fillStyle = 'rgb(84 104 255 / 0.35)'
          context.fill()
          context.beginPath()
          context.arc(x * dpr, y * dpr, 3.5 * dpr, 0, Math.PI * 2)
          context.fillStyle = ROUTE
          context.fill()
        }
      }

      const search = () => {
        const [start, goal] = pickEndpoints(roads, toScreen, width, height)
        return { endpoints: [start, goal], ...bidirectionalDijkstra(roads, start, goal) }
      }

      // Sin animación queda una búsqueda terminada, quieta
      if (reducedMotion) {
        const { endpoints, explored, path } = search()
        paintExplored(0, explored.length / 3, explored)
        paintRoute(path, 0, path.length - 1)
        paintEndpoints(endpoints)
        return
      }

      const animate = () => {
        const { endpoints, explored, path } = search()
        const total = explored.length / 3
        context.clearRect(0, 0, canvas.width, canvas.height)
        canvas.style.opacity = '1'
        paintEndpoints(endpoints)

        let previous = performance.now()
        let elapsed = 0
        let painted = 0
        let routed = 0

        const tick = (now: number) => {
          // Si la pestaña estuvo oculta, retoma donde estaba
          elapsed += Math.min(now - previous, 100)
          previous = now

          const reached = Math.min(total, Math.floor((elapsed / EXPLORE_MS) * total))
          if (reached > painted) {
            paintExplored(painted, reached, explored)
            painted = reached
            paintEndpoints(endpoints)
          }

          const routeTime = elapsed - EXPLORE_MS
          if (routeTime > 0) {
            const target = Math.min(path.length - 1, Math.floor((routeTime / ROUTE_MS) * (path.length - 1)))
            if (target > routed) {
              paintRoute(path, routed, target)
              routed = target
              paintEndpoints(endpoints)
            }
          }

          const fadeTime = routeTime - ROUTE_MS - HOLD_MS
          if (fadeTime > 0) canvas.style.opacity = String(Math.max(0, 1 - fadeTime / FADE_MS))

          if (fadeTime >= FADE_MS) animate()
          else frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      }
      animate()
    }

    const start = async () => {
      if (!desktop.matches || graph) return run()
      try {
        const [response, image] = await Promise.all([fetch(asset('roads.bin')), loadImage(asset(cv.personal.map))])
        if (!response.ok) return
        const buffer = await response.arrayBuffer()
        if (cancelled) return
        graph = parseRoads(buffer)
        map = image
        run()
      } catch {
        // Sin el grafo, el fondo queda como mapa quieto
      }
    }

    const restart = () => {
      stop()
      timer = window.setTimeout(start, 200)
    }

    start()
    window.addEventListener('resize', restart)
    return () => {
      cancelled = true
      stop()
      window.removeEventListener('resize', restart)
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} className="map-search" />
}
