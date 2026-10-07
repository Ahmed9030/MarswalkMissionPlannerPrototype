export type Point = {
  x: number
  y: number
}
export type RouteId = "A" | "B" | "C"
export type Route = {
  id: RouteId
  name: string
  risk: string
  distance: number
  minutes: number
  science: number
  terrain: string
  slope: number
  ascent: number
  comms: number
  color: string
  points: Point[]
  elevations: number[]
  targets: string[]
  hazards: string[]
}
export const targets = [
  {
    id: "A",
    name: "Rock outcrop",
    type: "Geological formation",
    x: 640,
    y: 225,
    time: 18,
    interest: "High",
    description:
      "Exposed bedrock may preserve evidence of the crater’s geological history.",
  },
  {
    id: "B",
    name: "Sediment layer",
    type: "Layered sediment",
    x: 455,
    y: 330,
    time: 24,
    interest: "High",
    description:
      "Layered deposits provide a simulated sampling opportunity to study past depositional environments.",
  },
  {
    id: "C",
    name: "Impact feature",
    type: "Impact structure",
    x: 765,
    y: 400,
    time: 12,
    interest: "Moderate",
    description:
      "Impact-exposed material may help compare surface and subsurface geology.",
  },
  {
    id: "D",
    name: "Possible water-related feature",
    type: "Candidate fluvial feature",
    x: 365,
    y: 155,
    time: 22,
    interest: "High",
    description:
      "A candidate channel-like feature for observation. Its origin is unconfirmed in this simulated dataset.",
  },
]
export const hazards = [
  {
    id: "slope",
    name: "Steep terrain",
    x: 555,
    y: 288,
    severity: "Medium",
    route: "B",
    mitigation:
      "Reduce walking pace, maintain 20 m separation, and reassess footing.",
    detail: "Local slope: 18° · exposed rocky ridge",
  },
  {
    id: "rocks",
    name: "Rocky terrain",
    x: 400,
    y: 440,
    severity: "Medium",
    route: "C",
    mitigation: "Use marked footholds and allow additional traverse time.",
    detail: "Loose blocks · uneven footing",
  },
  {
    id: "comms",
    name: "Communication blind spot",
    x: 700,
    y: 365,
    severity: "High",
    route: "C",
    mitigation:
      "Confirm relay visibility before entry; avoid the zone if link quality drops.",
    detail: "Simulated ridge-shadow region",
  },
  {
    id: "thermal",
    name: "Thermal exposure",
    x: 810,
    y: 180,
    severity: "Medium",
    route: "A",
    mitigation: "Limit dwell time and monitor suit thermal load.",
    detail: "Exposed sun-facing terrain",
  },
  {
    id: "nav",
    name: "Navigation uncertainty",
    x: 285,
    y: 245,
    severity: "Low",
    route: "A",
    mitigation: "Confirm position at the next mapped landmark.",
    detail: "Low-confidence terrain matching",
  },
]
export const routes: Route[] = [
  {
    id: "A",
    name: "Safest",
    risk: "Low",
    distance: 4.8,
    minutes: 134,
    science: 72,
    terrain: "Low",
    slope: 8,
    ascent: 42,
    comms: 98,
    color: "#93b5cd",
    points: [
      { x: 190, y: 470 },
      { x: 220, y: 380 },
      { x: 265, y: 320 },
      { x: 295, y: 235 },
      { x: 395, y: 210 },
      { x: 470, y: 175 },
      { x: 545, y: 165 },
      { x: 640, y: 225 },
    ],
    elevations: [
      32, 35, 40, 37, 43, 49, 48, 52, 55, 51, 57, 61, 62, 58, 64, 67, 70, 68,
    ],
    targets: ["A", "D"],
    hazards: ["nav"],
  },
  {
    id: "B",
    name: "Scientific",
    risk: "Medium",
    distance: 5.6,
    minutes: 151,
    science: 96,
    terrain: "Medium",
    slope: 14,
    ascent: 86,
    comms: 94,
    color: "#92c8ad",
    points: [
      { x: 190, y: 470 },
      { x: 265, y: 460 },
      { x: 310, y: 410 },
      { x: 385, y: 395 },
      { x: 455, y: 330 },
      { x: 480, y: 310 },
      { x: 470, y: 255 },
      { x: 525, y: 240 },
      { x: 565, y: 200 },
      { x: 610, y: 210 },
      { x: 640, y: 225 },
    ],
    elevations: [
      25, 31, 28, 38, 36, 47, 53, 45, 49, 56, 51, 68, 61, 73, 70, 82, 77, 80,
    ],
    targets: ["A", "B"],
    hazards: ["slope"],
  },
  {
    id: "C",
    name: "Fastest",
    risk: "Medium–High",
    distance: 3.9,
    minutes: 112,
    science: 61,
    terrain: "High",
    slope: 22,
    ascent: 112,
    comms: 79,
    color: "#d6a36d",
    points: [
      { x: 190, y: 470 },
      { x: 285, y: 425 },
      { x: 365, y: 370 },
      { x: 425, y: 355 },
      { x: 490, y: 315 },
      { x: 555, y: 265 },
      { x: 640, y: 225 },
    ],
    elevations: [
      25, 37, 29, 48, 65, 51, 75, 88, 70, 96, 83, 110, 91, 105, 97, 87, 85, 80,
    ],
    targets: ["A"],
    hazards: ["rocks", "comms"],
  },
]
export const starts = [
  { id: "jezero", name: "Jezero Crater · Basecamp", x: 190, y: 470 },
  { id: "delta", name: "Jezero · Delta staging site", x: 250, y: 355 },
  { id: "rim", name: "Jezero · Crater rim station", x: 180, y: 240 },
]
export const formatTime = (minutes: number) =>
  `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`
export const clockTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
export type MissionConfig = {
  start: string
  destination: string
  objective: string
  risk: string
}
export type MissionResult = {
  routes: Route[]
  recommended: RouteId
  config: MissionConfig
}
export interface MissionDataProvider {
  plan(config: MissionConfig): Promise<MissionResult>
}
// Adapter boundary: replace this provider with validated raster/vector dataset analysis.
// These values are illustrative, not NASA operational recommendations.
export const mockMissionProvider: MissionDataProvider = {
  async plan(config: MissionConfig): Promise<MissionResult> {
    const start = starts.find((s) => s.id === config.start)!
    const destination = targets.find((t) => t.id === config.destination)!
    const modified = config.start !== "jezero" || config.destination !== "A"
    const candidates = routes.map((route) => {
      const points = route.points.map((p) => ({ ...p }))
      points[0] = { x: start.x, y: start.y }
      points[points.length - 1] = { x: destination.x, y: destination.y }
      const length = points.reduce(
        (sum, p, i) =>
          i
            ? sum + Math.hypot(p.x - points[i - 1].x, p.y - points[i - 1].y)
            : 0,
        0,
      )
      const original = route.points.reduce(
        (sum, p, i) =>
          i
            ? sum +
              Math.hypot(
                p.x - route.points[i - 1].x,
                p.y - route.points[i - 1].y,
              )
            : 0,
        0,
      )
      const ratio = length / original
      return {
        ...route,
        points,
        distance: modified
          ? +(route.distance * ratio).toFixed(1)
          : route.distance,
        minutes: modified ? Math.round(route.minutes * ratio) : route.minutes,
        targets: [
          ...new Set([
            ...route.targets.filter((id) => id !== "A"),
            destination.id,
          ]),
        ],
      }
    })
    const recommended: RouteId =
      config.risk === "Low" || config.objective === "Maximum Safety"
        ? "A"
        : config.objective === "Minimum EVA Time"
          ? "C"
          : "B"
    await new Promise((resolve) => setTimeout(resolve, 700))
    return { routes: candidates, recommended, config: { ...config } }
  },
}
