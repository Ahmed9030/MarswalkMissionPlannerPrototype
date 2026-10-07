import { useEffect, useRef, useState } from "react"
import type { PointerEvent } from "react"
import {
  hazards,
  starts,
  targets,
  type Point,
  type Route,
  type RouteId,
} from "../data/mission"
import Terrain from "./Terrain"
import { Button, Heading, Icon } from "./ui"

export type MapFeature = {
  type: "target" | "hazard"
  id: string
} | null
export default function MarsMap({
  routes,
  selected,
  onRoute,
  start,
  destination,
  feature,
  onFeature,
  focus,
  onStart,
  onDestination,
}: {
  routes: Route[]
  selected: RouteId
  onRoute: (id: RouteId) => void
  start: string
  destination: string
  feature: MapFeature
  onFeature: (feature: MapFeature) => void
  focus: Point | null
  onStart: (id: string) => void
  onDestination: (id: string) => void
}) {
  const [layers, setLayers] = useState<Record<string, boolean>>({
    Terrain: true,
    Elevation: true,
    "Scientific targets": true,
    Hazards: true,
    Communication: true,
    Thermal: false,
    "Rover tracks": false,
    Slope: false,
  })
  const [showRoutes, setShowRoutes] = useState(true)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [expanded, setExpanded] = useState(false)
  const [pick, setPick] = useState<"start" | "destination" | null>(null)
  const [layerOpen, setLayerOpen] = useState(true)
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)")
    const adapt = () => setLayerOpen(!media.matches)
    adapt()
    media.addEventListener("change", adapt)
    return () => media.removeEventListener("change", adapt)
  }, [])
  const drag = useRef<{
    x: number
    y: number
    pan: Point
    moved: boolean
  } | null>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const base = starts.find((s) => s.id === start)!
  const target =
    feature?.type === "target" ? targets.find((t) => t.id === feature.id) : null
  const hazard =
    feature?.type === "hazard" ? hazards.find((h) => h.id === feature.id) : null
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button,[role=button]")) return
    drag.current = { x: event.clientX, y: event.clientY, pan, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    const dx = event.clientX - drag.current.x,
      dy = event.clientY - drag.current.y
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true
    setPan({ x: drag.current.pan.x + dx, y: drag.current.pan.y + dy })
  }
  const markerKey = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      action()
    }
  }
  const targetClick = (id: string) => {
    if (pick === "destination") {
      onDestination(id)
      setPick(null)
    } else onFeature({ type: "target", id })
  }
  return (
    <section
      className={`map-panel ${expanded ? "map-expanded" : ""}`}
      aria-label="Interactive simulated Mars map"
    >
      <div className="map-heading">
        <div className="map-heading-title">
          <Icon name="globe" size={16} />
          <strong>JEZERO CRATER</strong>
          <span className="subtle"> / SURFACE MAP</span>
        </div>
        <div className="map-live">
          <span className="status-dot" /> LOCAL FRAME{" "}
          <span className="map-resolution">18.44°N · 77.45°E</span>
        </div>
      </div>
      <div
        className="map-viewport"
        ref={viewport}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <div
          className="map-world"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          <Terrain visible={layers.Terrain} />
          <svg
            viewBox="0 0 1000 700"
            preserveAspectRatio="none"
            className="map-svg"
          >
            <defs>
              <pattern
                id="mapGrid"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M100 0H0V100"
                  fill="none"
                  stroke="white"
                  strokeOpacity=".1"
                  strokeWidth=".7"
                />
                <path d="M48 50h4m-2-2v4" stroke="white" strokeOpacity=".15" />
              </pattern>
              <pattern
                id="hazardHatch"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(35)"
              >
                <path
                  d="M0 0v10"
                  stroke="#e2a876"
                  strokeOpacity=".4"
                  strokeWidth="2"
                />
              </pattern>
              <radialGradient id="thermal">
                <stop stopColor="#d5683d" stopOpacity=".35" />
                <stop offset="1" stopColor="#d5683d" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1000" height="700" fill="url(#mapGrid)" />
            {layers.Elevation && (
              <g
                className="elevation-lines"
                fill="none"
                stroke="#d4bc9e"
                strokeWidth=".7"
                opacity=".2"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <path
                    key={i}
                    d={`M-50 ${100 + i * 37} Q180 ${20 + i * 42} 360 ${110 + i * 42} T720 ${90 + i * 41} T1100 ${100 + i * 42}`}
                  />
                ))}
              </g>
            )}
            {layers.Communication && (
              <g>
                <ellipse
                  cx={base.x}
                  cy={base.y}
                  rx="305"
                  ry="250"
                  fill="#76afa3"
                  fillOpacity=".035"
                  stroke="#9dcab8"
                  strokeOpacity=".35"
                  strokeWidth="1"
                  strokeDasharray="5 7"
                />
                <ellipse
                  cx={base.x}
                  cy={base.y}
                  rx="210"
                  ry="172"
                  fill="none"
                  stroke="#9dcab8"
                  strokeOpacity=".15"
                  strokeDasharray="3 7"
                />
                <text
                  x="180"
                  y="659"
                  fill="#aac3b2"
                  fontSize="10"
                  letterSpacing="2"
                >
                  RELAY COVERAGE
                </text>
              </g>
            )}
            {layers.Thermal && (
              <g>
                <ellipse
                  cx="810"
                  cy="180"
                  rx="230"
                  ry="160"
                  fill="url(#thermal)"
                />
                <text
                  x="770"
                  y="118"
                  fill="#efb18b"
                  fontSize="11"
                  letterSpacing="1"
                >
                  THERMAL EXPOSURE
                </text>
              </g>
            )}
            {layers.Slope && (
              <g
                fill="#d6a36d"
                fillOpacity=".16"
                stroke="#d6a36d"
                strokeOpacity=".4"
              >
                <path d="m475 200 125-15 30 105-85 55-75-45Z" />
                <path d="m660 345 90-35 80 100-80 45Z" />
              </g>
            )}
            {layers["Rover tracks"] && (
              <g>
                <path
                  d="M100 600 120 530 175 550 190 470 205 440 250 415 300 410"
                  fill="none"
                  stroke="#d5c9b9"
                  strokeWidth="2"
                  strokeDasharray="2 5"
                />
                <text x="105" y="590" fill="#d5c9b9" fontSize="10">
                  SIMULATED ROVER TRACK
                </text>
              </g>
            )}
            <g
              className="terrain-labels"
              fill="#d8c9b7"
              opacity=".48"
              fontSize="12"
              letterSpacing="4"
            >
              <text x="120" y="135" transform="rotate(-12 120 135)">
                WESTERN DELTA
              </text>
              <text x="580" y="560" transform="rotate(-9 580 560)">
                CRATER FLOOR
              </text>
              <text x="815" y="320" transform="rotate(70 815 320)">
                EASTERN RIDGE
              </text>
            </g>
            {layers.Hazards && (
              <g>
                {hazards.slice(0, 3).map((h) => (
                  <g key={h.id}>
                    <path
                      d={`M${h.x - 55} ${h.y - 45} l75 -10 35 45 -25 50 -65 -5 -30 -35Z`}
                      fill="url(#hazardHatch)"
                      stroke="#d2a278"
                      strokeWidth="1"
                      strokeOpacity=".5"
                    />
                  </g>
                ))}
              </g>
            )}
            {showRoutes && (
              <g>
                {[...routes]
                  .sort(
                    (a, b) =>
                      Number(a.id === selected) - Number(b.id === selected),
                  )
                  .map((route) => {
                    const points = route.points
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")
                    return (
                      <g
                        key={route.id}
                        className={`map-route ${
                          route.id === selected ? "route-active" : ""
                        }`}
                        onClick={() => onRoute(route.id)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select Route ${route.id}, ${route.name}`}
                        onKeyDown={(e) => markerKey(e, () => onRoute(route.id))}
                      >
                        <polyline
                          points={points}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="22"
                        />
                        {route.id === selected && (
                          <polyline
                            points={points}
                            fill="none"
                            stroke="#111b16"
                            strokeWidth="7"
                            strokeOpacity=".65"
                          />
                        )}
                        <polyline
                          points={points}
                          fill="none"
                          stroke={route.color}
                          strokeWidth={route.id === selected ? 3.5 : 2}
                          strokeDasharray={route.id === selected ? "" : "6 6"}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          opacity={route.id === selected ? 1 : 0.55}
                        />
                        {route.id === selected &&
                          route.points
                            .filter((_, i) => i % 2 === 0)
                            .slice(1, -1)
                            .map((p, i) => (
                              <circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="3"
                                fill="#b6dfc4"
                                stroke="#354d3c"
                                strokeWidth="1.5"
                              />
                            ))}
                      </g>
                    )
                  })}
              </g>
            )}
            {showRoutes && (
              <g fontSize="11" letterSpacing="1.3">
                {routes.map((r) => (
                  <g
                    key={r.id}
                    transform={`translate(${r.points[3].x - 32} ${r.points[3].y - 32})`}
                  >
                    <rect
                      width="69"
                      height="22"
                      rx="3"
                      fill="#151918"
                      fillOpacity=".86"
                      stroke={r.color}
                      strokeOpacity=".35"
                    />
                    <text x="10" y="15" fill={r.color}>
                      ROUTE {r.id}
                    </text>
                  </g>
                ))}
              </g>
            )}
            {layers.Hazards &&
              hazards.map((h) => (
                <g
                  key={h.id}
                  transform={`translate(${h.x} ${h.y})`}
                  className="map-marker hazard-marker"
                  role="button"
                  tabIndex={0}
                  aria-label={`Hazard: ${h.name}`}
                  onClick={() => onFeature({ type: "hazard", id: h.id })}
                  onKeyDown={(e) =>
                    markerKey(e, () => onFeature({ type: "hazard", id: h.id }))
                  }
                >
                  <circle
                    r="15"
                    fill="#322c25"
                    stroke="#d8a36f"
                    strokeOpacity=".3"
                  />
                  <path
                    d="m0-8 8 14H-8L0-8Z"
                    fill="none"
                    stroke="#e1b783"
                    strokeWidth="1.3"
                  />
                  <path d="M0-3v4m0 3v1" stroke="#e1b783" strokeWidth="1.4" />
                </g>
              ))}
            {layers["Scientific targets"] &&
              targets.map((t) => (
                <g
                  key={t.id}
                  transform={`translate(${t.x} ${t.y})`}
                  className={`map-marker ${
                    t.id === destination ? "destination-marker" : ""
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Scientific Target ${t.id}: ${t.name}`}
                  onClick={() => targetClick(t.id)}
                  onKeyDown={(e) => markerKey(e, () => targetClick(t.id))}
                >
                  <circle
                    r="19"
                    fill="#121a16"
                    fillOpacity=".7"
                    stroke="#a6cdb4"
                    strokeOpacity=".3"
                  />
                  <path
                    d="m0-9 9 9-9 9-9-9Z"
                    fill="#24392c"
                    stroke="#b8d6bf"
                    strokeWidth="1.4"
                  />
                  <circle r="2" fill="#c5e5cb" />
                  <rect
                    x="23"
                    y="-12"
                    width={t.id === destination ? 130 : 72}
                    height="25"
                    rx="3"
                    fill="#131916"
                    fillOpacity=".85"
                  />
                  <text
                    x="32"
                    y="4"
                    fill="#d2dfd3"
                    fontSize="10"
                    letterSpacing=".6"
                  >
                    TARGET {t.id}
                    {t.id === destination ? " · DESTINATION" : ""}
                  </text>
                </g>
              ))}
            <g
              transform={`translate(${base.x} ${base.y})`}
              className="map-marker"
              role="button"
              tabIndex={0}
              aria-label="Select basecamp starting location"
              onClick={() => {
                setPick(pick === "start" ? null : "start")
              }}
              onKeyDown={(e) => markerKey(e, () => setPick("start"))}
            >
              <circle
                r="24"
                fill="#19201c"
                fillOpacity=".6"
                stroke="#e5e1d3"
                strokeOpacity=".3"
              />
              <circle r="14" fill="#eee6d7" />
              <path d="m-6 4 6-10 6 10H-6Z" fill="#353a32" />
              <rect
                x="-50"
                y="32"
                width="100"
                height="23"
                rx="3"
                fill="#171b18"
                fillOpacity=".85"
              />
              <text
                x="-37"
                y="47"
                fill="#e6e5db"
                fontSize="10"
                letterSpacing="1"
              >
                EVA BASECAMP
              </text>
            </g>
            {pick === "start" &&
              starts
                .filter((s) => s.id !== start)
                .map((s) => (
                  <g
                    key={s.id}
                    transform={`translate(${s.x} ${s.y})`}
                    role="button"
                    tabIndex={0}
                    className="map-marker"
                    aria-label={`Set start ${s.name}`}
                    onClick={() => {
                      onStart(s.id)
                      setPick(null)
                    }}
                    onKeyDown={(e) =>
                      markerKey(e, () => {
                        onStart(s.id)
                        setPick(null)
                      })
                    }
                  >
                    <circle r="18" fill="#ba7150" stroke="#ecd1b9" />
                    <text x="-5" y="5" fill="white" fontSize="16">
                      +
                    </text>
                  </g>
                ))}
            {focus && (
              <g
                transform={`translate(${focus.x} ${focus.y})`}
                className="focus-marker"
              >
                <circle r="25" fill="none" stroke="#e8dfc9" strokeWidth="1.5" />
                <circle
                  r="32"
                  fill="none"
                  stroke="#e8dfc9"
                  strokeOpacity=".5"
                />
                <path d="M-40 0h13M27 0h13M0-40v13M0 27v13" stroke="#e8dfc9" />
              </g>
            )}
          </svg>
        </div>
        <div className="map-topbar">
          <span className="map-mode">
            <span className="status-dot orange" /> ORBITAL TERRAIN{" "}
            <span className="divider-text">/</span> 2D
          </span>
          <Button
            className="map-chip"
            onClick={() => setShowRoutes(!showRoutes)}
            aria-pressed={showRoutes}
          >
            <Icon name="route" size={13} />
            {showRoutes ? "3 routes visible" : "Routes hidden"}
          </Button>
        </div>
        <div className="compass">
          <span>N</span>
          <svg viewBox="0 0 40 40" width="38" height="38">
            <path d="m20 5 7 25-7-5-7 5Z" fill="#e0dacd" />
            <path d="m20 5 0 20-7 5Z" fill="#837b6d" />
          </svg>
        </div>
        {pick && (
          <div className="map-pick-hint">
            {pick === "start"
              ? "Choose a marked staging site"
              : "Click a scientific target to set destination"}
            <Button
              aria-label="Cancel map selection"
              onClick={() => setPick(null)}
            >
              <Icon name="close" size={14} />
            </Button>
          </div>
        )}
        <div className="layer-control">
          <Button
            className="layer-title"
            onClick={() => setLayerOpen(!layerOpen)}
            aria-expanded={layerOpen}
          >
            <Icon name="layers" size={14} />
            <span>MAP LAYERS</span>
            <span className="layer-count">
              {Object.values(layers).filter(Boolean).length}
            </span>
            <Icon name={layerOpen ? "minus" : "plus"} size={13} />
          </Button>
          {layerOpen && (
            <div className="layer-list">
              {Object.keys(layers).map((name) => (
                <Button
                  key={name}
                  role="checkbox"
                  aria-checked={layers[name]}
                  className="layer-item"
                  onClick={() =>
                    setLayers({ ...layers, [name]: !layers[name] })
                  }
                >
                  <span className={`checkbox ${layers[name] ? "checked" : ""}`}>
                    {layers[name] && <Icon name="check" size={10} />}
                  </span>
                  <span>{name}</span>
                  <span
                    className={`layer-key key-${name.toLowerCase().replace(/ /g, "-")}`}
                  />
                </Button>
              ))}
            </div>
          )}
        </div>
        <div className="map-controls">
          <Button
            aria-label="Zoom in"
            onClick={() => setScale(Math.min(3, scale + 0.25))}
          >
            <Icon name="plus" />
          </Button>
          <Button
            aria-label="Zoom out"
            onClick={() => setScale(Math.max(0.75, scale - 0.25))}
          >
            <Icon name="minus" />
          </Button>
          <span />
          <Button
            aria-label="Reset map view"
            onClick={() => {
              setScale(1)
              setPan({ x: 0, y: 0 })
            }}
          >
            <Icon name="target" />
          </Button>
          <Button
            aria-label={expanded ? "Exit expanded map" : "Expand map"}
            onClick={() => setExpanded(!expanded)}
          >
            <Icon name={expanded ? "close" : "expand"} />
          </Button>
        </div>
        <div className="map-scale">
          <div />
          <span>{(1 / scale).toFixed(1)} km</span>
        </div>
        <div className="map-coordinates">
          JEZ–LOCAL <span>·</span> ELEV. −2,540 m
        </div>
        {(target || hazard) && (
          <div className="feature-popup">
            <div className="feature-popup-head">
              <span className="eyebrow">
                {target ? "SCIENTIFIC POINT OF INTEREST" : "TERRAIN ADVISORY"}
              </span>
              <Button
                aria-label="Close information"
                onClick={() => onFeature(null)}
              >
                <Icon name="close" size={16} />
              </Button>
            </div>
            <Heading>
              {target ? `Target ${target.id} — ${target.name}` : hazard?.name}
            </Heading>
            <div className="popup-badge">
              <Icon name={target ? "target" : "warning"} size={13} />
              {target
                ? `${target.interest} scientific interest`
                : `${hazard?.severity} severity · Route ${hazard?.route}`}
            </div>
            {target ? (
              <>
                <div className="popup-row">
                  <span>Target type</span>
                  <strong>{target.type}</strong>
                </div>
                <div className="popup-row">
                  <span>Observation time</span>
                  <strong>{target.time} min</strong>
                </div>
                <p>{target.description}</p>
                <Button
                  className="text-button"
                  onClick={() => {
                    onDestination(target.id)
                    onFeature(null)
                  }}
                >
                  Set as destination <Icon name="arrow" size={14} />
                </Button>
              </>
            ) : (
              <>
                <p>{hazard?.detail}</p>
                <div className="eyebrow">MITIGATION</div>
                <p>{hazard?.mitigation}</p>
              </>
            )}
            <span className="popup-foot">ILLUSTRATIVE MOCK DATA</span>
          </div>
        )}
        <div className="map-select-actions">
          <Button
            aria-pressed={pick === "start"}
            onClick={() => setPick(pick === "start" ? null : "start")}
          >
            <Icon name="pin" size={13} />
            Set start
          </Button>
          <Button
            aria-pressed={pick === "destination"}
            onClick={() => {
              setLayers({ ...layers, "Scientific targets": true })
              setPick(pick === "destination" ? null : "destination")
            }}
          >
            <Icon name="target" size={13} />
            Set destination
          </Button>
        </div>
      </div>
      <div className="map-footer">
        <span>
          <Icon name="info" size={11} /> SIMULATED DATA — NASA DATASETS WILL BE
          INTEGRATED
        </span>
        <span className="subtle">
          RELIEF IS ILLUSTRATIVE · NOT FOR NAVIGATION
        </span>
      </div>
    </section>
  )
}
