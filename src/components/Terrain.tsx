import { useEffect, useRef } from "react"

let cachedTerrain: ImageData | null = null

// Deterministic synthetic relief. No geographic accuracy is implied.
export default function Terrain({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = 1200,
      h = 840
    canvas.width = w
    canvas.height = h
    if (cachedTerrain) {
      ctx.putImageData(cachedTerrain, 0, 0)
      return
    }
    const hash = (x: number, y: number) => {
      const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
      return v - Math.floor(v)
    }
    const noise = (x: number, y: number) => {
      const ix = Math.floor(x),
        iy = Math.floor(y)
      let fx = x - ix,
        fy = y - iy
      fx = fx * fx * (3 - 2 * fx)
      fy = fy * fy * (3 - 2 * fy)
      return (
        (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy) +
        (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy
      )
    }
    const craters = Array.from({ length: 38 }, (_, i) => ({
      x: hash(i, 91) * w,
      y: hash(i, 32) * h,
      r: 12 + hash(i, 9) ** 3 * 155,
    }))
    const heights = new Float32Array(w * h)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let z = 0,
          amp = 65
        for (let o = 0; o < 7; o++) {
          z += noise(x / (260 / 2 ** o), y / (260 / 2 ** o)) * amp
          amp *= 0.52
        }
        // Winding eroded delta channels and a broad crater basin.
        const channel = Math.abs(
          y - (405 + Math.sin(x * 0.009) * 95 + Math.sin(x * 0.023) * 25),
        )
        z -= Math.exp((-channel * channel) / 550) * 15
        z += Math.sin(x * 0.014 + y * 0.006 + noise(x / 110, y / 110) * 5) * 9
        for (const c of craters) {
          const d = Math.hypot(x - c.x, y - c.y) / c.r
          if (d < 1.5)
            z +=
              Math.exp(-(((d - 1) / 0.13) ** 2)) * c.r * 0.2 -
              Math.max(0, 1 - d * d) * c.r * 0.16
        }
        heights[y * w + x] = z
      }
    const image = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = y * w + x,
          z = heights[i]
        const dx =
          heights[y * w + Math.min(w - 1, x + 1)] -
          heights[y * w + Math.max(0, x - 1)]
        const dy =
          heights[Math.min(h - 1, y + 1) * w + x] -
          heights[Math.max(0, y - 1) * w + x]
        const shade = Math.max(
          0.28,
          Math.min(1.55, 0.84 - dx * 0.42 - dy * 0.58),
        )
        const grain = hash(x, y) * 8
        image.data[i * 4] = (97 + z * 0.64 + grain) * shade
        image.data[i * 4 + 1] = (68 + z * 0.4 + grain) * shade
        image.data[i * 4 + 2] = (51 + z * 0.31 + grain) * shade
        image.data[i * 4 + 3] = 255
      }
    ctx.putImageData(image, 0, 0)
    // Contour strokes sampled from the synthetic elevation field.
    ctx.strokeStyle = "rgba(223,192,151,0.12)"
    ctx.lineWidth = 0.55
    for (let level = 25; level < 125; level += 9) {
      ctx.beginPath()
      for (let y = 0; y < h - 5; y += 5)
        for (let x = 0; x < w - 5; x += 5) {
          const a = heights[y * w + x],
            b = heights[y * w + x + 5],
            c = heights[(y + 5) * w + x + 5],
            d = heights[(y + 5) * w + x]
          const hits: [number, number][] = []
          if (a < level !== b < level)
            hits.push([x + (5 * (level - a)) / (b - a), y])
          if (b < level !== c < level)
            hits.push([x + 5, y + (5 * (level - b)) / (c - b)])
          if (c < level !== d < level)
            hits.push([x + 5 - (5 * (level - c)) / (d - c), y + 5])
          if (d < level !== a < level)
            hits.push([x, y + 5 - (5 * (level - d)) / (a - d)])
          if (hits.length >= 2) {
            ctx.moveTo(...hits[0])
            ctx.lineTo(...hits[1])
          }
        }
      ctx.stroke()
    }
    cachedTerrain = ctx.getImageData(0, 0, w, h)
  }, [])
  return (
    <canvas
      ref={ref}
      className={`terrain-canvas ${visible ? "" : "terrain-hidden"}`}
      aria-label="Procedurally generated simulated Martian terrain relief"
    />
  )
}
