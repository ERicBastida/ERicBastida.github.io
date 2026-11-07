"""Saca el grafo de calles del mapa de fondo y lo guarda en public/roads.bin.

Al salir de la misma imagen, el recorrido animado coincide con lo que se ve.
Requiere numpy, scipy, scikit-image y pillow.

Formato (little endian): Uint32 [nodos, aristas, aristas principales],
Uint16 [x, y] por nodo y Uint16 [a, b] por arista, con las principales primero.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.measure import approximate_polygon
from skimage.morphology import skeletonize

ROOT = Path(__file__).resolve().parent.parent
THRESHOLD = int(sys.argv[1]) if len(sys.argv) > 1 else 30
MAJOR_BRIGHTNESS = 120
MIN_SPUR = 6
TOLERANCE = 1.2
CREDIT_TOP = 1325  # el crédito de la imagen no es una calle

gray = np.array(Image.open(ROOT / 'public/buenos-aires.jpg').convert('L'))
roads = gray >= THRESHOLD
roads[CREDIT_TOP:] = False

labels, _ = ndi.label(roads, structure=np.ones((3, 3)))
largest = np.bincount(labels.ravel())[1:].argmax() + 1
skeleton = skeletonize(labels == largest)

NEIGHBORS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
pixels = {(int(y), int(x)) for y, x in zip(*np.nonzero(skeleton))}
around = {p: [(p[0] + dy, p[1] + dx) for dy, dx in NEIGHBORS if (p[0] + dy, p[1] + dx) in pixels] for p in pixels}

# Las cadenas de píxeles entre cruces son los tramos de calle
ends = {p for p, near in around.items() if len(near) != 2}
chains, seen = [], set()
for start in ends:
    for first in around[start]:
        if (start, first) in seen:
            continue
        chain, previous, current = [start, first], start, first
        while current not in ends:
            following = [p for p in around[current] if p != previous]
            if not following:
                break
            previous, current = current, following[0]
            chain.append(current)
        seen.add((start, first))
        seen.add((chain[-1], chain[-2]))
        chains.append(chain)

# Descarta las puntas sueltas cortas que deja el esqueleto
degree = {p: len(around[p]) for p in ends}
chains = [c for c in chains if len(c) >= MIN_SPUR or (degree[c[0]] > 1 and degree[c[-1]] > 1)]

ids, nodes, edges = {}, [], []
def node(point):
    if point not in ids:
        ids[point] = len(nodes)
        nodes.append((point[1], point[0]))
    return ids[point]

for chain in chains:
    points = np.array(chain)
    brightness = gray[points[:, 0], points[:, 1]].mean()
    simple = approximate_polygon(points, TOLERANCE)
    path = [node((int(y), int(x))) for y, x in simple]
    for a, b in zip(path, path[1:]):
        if a != b:
            edges.append((brightness >= MAJOR_BRIGHTNESS, a, b))

# Se queda con el componente conexo más grande del grafo final
parent = list(range(len(nodes)))
def find(n):
    while parent[n] != n:
        parent[n] = parent[parent[n]]
        n = parent[n]
    return n
for _, a, b in edges:
    parent[find(a)] = find(b)
roots = np.array([find(n) for n in range(len(nodes))])
main = np.bincount(roots).argmax()
keep = np.nonzero(roots == main)[0]
remap = {int(old): new for new, old in enumerate(keep)}
edges = [(major, remap[a], remap[b]) for major, a, b in edges if a in remap and b in remap]
nodes = [nodes[int(n)] for n in keep]
edges.sort(key=lambda edge: not edge[0])
majors = sum(1 for edge in edges if edge[0])

assert len(nodes) < 65536
path = ROOT / 'public/roads.bin'
with open(path, 'wb') as out:
    out.write(np.array([len(nodes), len(edges), majors], dtype='<u4').tobytes())
    out.write(np.array(nodes, dtype='<u2').tobytes())
    out.write(np.array([(a, b) for _, a, b in edges], dtype='<u2').tobytes())
print(f'{len(nodes)} nodos, {len(edges)} aristas, {majors} principales, {path.stat().st_size / 1024:.0f} KB')
