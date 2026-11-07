// Grafo de calles generado por scripts/build-roads.py
export interface RoadGraph {
  size: number
  x: Uint16Array
  y: Uint16Array
  // Vecinos de cada nodo en formato compacto: offsets[n]..offsets[n + 1]
  offsets: Uint32Array
  targets: Uint16Array
  weights: Float32Array
  major: Uint8Array
}

export interface SearchResult {
  // Tramos explorados, en orden: [a, b, principal] por tramo
  explored: Uint32Array
  path: number[]
}

export function parseRoads(buffer: ArrayBuffer): RoadGraph {
  const [size, edgeCount, majors] = new Uint32Array(buffer, 0, 3)
  const points = new Uint16Array(buffer, 12, size * 2)
  const edges = new Uint16Array(buffer, 12 + size * 4, edgeCount * 2)

  const x = new Uint16Array(size)
  const y = new Uint16Array(size)
  for (let n = 0; n < size; n++) {
    x[n] = points[n * 2]
    y[n] = points[n * 2 + 1]
  }

  const offsets = new Uint32Array(size + 1)
  for (const node of edges) offsets[node + 1]++
  for (let n = 0; n < size; n++) offsets[n + 1] += offsets[n]

  const next = offsets.slice()
  const targets = new Uint16Array(edgeCount * 2)
  const weights = new Float32Array(edgeCount * 2)
  const major = new Uint8Array(edgeCount * 2)
  for (let e = 0; e < edgeCount; e++) {
    const a = edges[e * 2]
    const b = edges[e * 2 + 1]
    const length = Math.hypot(x[a] - x[b], y[a] - y[b])
    for (const [from, to] of [[a, b], [b, a]]) {
      const slot = next[from]++
      targets[slot] = to
      weights[slot] = length
      major[slot] = e < majors ? 1 : 0
    }
  }

  return { size, x, y, offsets, targets, weights, major }
}

class MinHeap {
  private nodes: number[] = []
  private keys: number[] = []

  get top() {
    return this.keys.length ? this.keys[0] : Infinity
  }

  push(node: number, key: number) {
    let i = this.keys.length
    this.nodes.push(node)
    this.keys.push(key)
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.keys[parent] <= key) break
      this.keys[i] = this.keys[parent]
      this.nodes[i] = this.nodes[parent]
      i = parent
    }
    this.keys[i] = key
    this.nodes[i] = node
  }

  pop(): number {
    const first = this.nodes[0]
    const node = this.nodes.pop()!
    const key = this.keys.pop()!
    const size = this.keys.length
    let i = 0
    while (size > 0) {
      let child = 2 * i + 1
      if (child >= size) break
      if (child + 1 < size && this.keys[child + 1] < this.keys[child]) child++
      if (this.keys[child] >= key) break
      this.keys[i] = this.keys[child]
      this.nodes[i] = this.nodes[child]
      i = child
    }
    if (size > 0) {
      this.keys[i] = key
      this.nodes[i] = node
    }
    return first
  }
}

export function bidirectionalDijkstra(graph: RoadGraph, start: number, goal: number): SearchResult {
  const { size, offsets, targets, weights, major } = graph
  const sides = [start, goal].map((source) => {
    const dist = new Float64Array(size).fill(Infinity)
    const prev = new Int32Array(size).fill(-1)
    const settled = new Uint8Array(size)
    const heap = new MinHeap()
    dist[source] = 0
    heap.push(source, 0)
    return { dist, prev, settled, heap }
  })

  const explored: number[] = []
  let best = Infinity
  let meetFrom = -1
  let meetTo = -1
  let meetSide = 0

  // Termina cuando ninguna ruta sin explorar puede mejorar la mejor encontrada
  while (sides[0].heap.top + sides[1].heap.top < best) {
    const turn = sides[0].heap.top <= sides[1].heap.top ? 0 : 1
    const side = sides[turn]
    const other = sides[1 - turn]
    const u = side.heap.pop()
    if (side.settled[u]) continue
    side.settled[u] = 1

    for (let slot = offsets[u]; slot < offsets[u + 1]; slot++) {
      const v = targets[slot]
      if (side.settled[v]) explored.push(u, v, major[slot])

      const candidate = side.dist[u] + weights[slot]
      if (candidate < side.dist[v]) {
        side.dist[v] = candidate
        side.prev[v] = u
        side.heap.push(v, candidate)
      }

      const through = side.dist[u] + weights[slot] + other.dist[v]
      if (through < best) {
        best = through
        meetFrom = u
        meetTo = v
        meetSide = turn
      }
    }
  }

  const path: number[] = []
  if (meetFrom >= 0) {
    const near = sides[meetSide]
    const far = sides[1 - meetSide]
    for (let n = meetFrom; n >= 0; n = near.prev[n]) path.unshift(n)
    for (let n = meetTo; n >= 0; n = far.prev[n]) path.push(n)
    if (meetSide === 1) path.reverse()
  }

  return { explored: Uint32Array.from(explored), path }
}
