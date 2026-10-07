import { useState } from "react"
import MarsMap, { type MapFeature } from "./components/MarsMap"
import { Button, Heading, Icon, Select } from "./components/ui"
import {
  clockTime,
  formatTime,
  mockMissionProvider,
  routes as initialRoutes,
  starts,
  targets,
  hazards,
  type MissionConfig,
  type Point,
  type Route,
  type RouteId,
} from "./data/mission"

const initialConfig: MissionConfig = {
  start: "jezero",
  destination: "A",
  objective: "Balanced Mission",
  risk: "Medium",
}
const sources = [
  {
    name: "MOLA",
    description: "Elevation & topography",
    status: "Planned integration",
  },
  {
    name: "HiRISE",
    description: "High-resolution terrain imagery",
    status: "Planned integration",
  },
  {
    name: "THEMIS",
    description: "Thermal & surface properties",
    status: "Planned integration",
  },
  {
    name: "NASA PDS",
    description: "Planetary science archives",
    status: "Planned integration",
  },
  {
    name: "NASA Earthdata",
    description: "Dataset discovery where applicable",
    status: "Planned integration",
  },
  {
    name: "Mars rover datasets",
    description: "Geology, imagery & traverse context",
    status: "Planned integration",
  },
]

function ElevationChart({ route }: { route: Route }) {
  const [hover, setHover] = useState<number | null>(null)
  const points = route.elevations
    .map(
      (v, i) =>
        `${10 + (i * 270) / (route.elevations.length - 1)},${100 - v * 0.7}`,
    )
    .join(" ")
  return (
    <div className="elevation-chart">
      <div className="chart-label">
        <span>RELATIVE ELEVATION</span>
        <span>
          {hover === null
            ? `↑ ${route.ascent} m gain`
            : `${((hover / (route.elevations.length - 1)) * route.distance).toFixed(1)} km · ${route.elevations[hover]} m`}
        </span>
      </div>
      <svg
        viewBox="0 0 300 114"
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Route ${route.id} elevation profile, ${route.ascent} meters elevation gain`}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={route.color} stopOpacity=".22" />
            <stop offset="1" stopColor={route.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="10"
            x2="280"
            y1={y}
            y2={y}
            stroke="#2a2e2b"
            strokeDasharray="3 4"
          />
        ))}
        <polygon points={`10,105 ${points} 280,105`} fill="url(#chartFill)" />
        <polyline
          points={points}
          stroke={route.color}
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
        {route.elevations.map((v, i) => (
          <rect
            key={i}
            x={2 + (i * 270) / (route.elevations.length - 1)}
            y="0"
            width="17"
            height="108"
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
        {hover !== null && (
          <g>
            <line
              x1={10 + (hover * 270) / (route.elevations.length - 1)}
              x2={10 + (hover * 270) / (route.elevations.length - 1)}
              y1="0"
              y2="104"
              stroke={route.color}
              strokeDasharray="3 3"
            />
            <circle
              cx={10 + (hover * 270) / (route.elevations.length - 1)}
              cy={100 - route.elevations[hover] * 0.7}
              r="3"
              fill={route.color}
            />
          </g>
        )}
      </svg>
      <div className="chart-axis">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i}>
            {((route.distance * i) / 5).toFixed(i === 0 ? 0 : 1)}
            <small>{i === 5 ? " km" : ""}</small>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [config, setConfig] = useState<MissionConfig>(initialConfig)
  const [generatedConfig, setGeneratedConfig] =
    useState<MissionConfig>(initialConfig)
  const [routes, setRoutes] = useState(initialRoutes)
  const [selected, setSelected] = useState<RouteId>("B")
  const [recommended, setRecommended] = useState<RouteId>("B")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [feature, setFeature] = useState<MapFeature>(null)
  const [focus, setFocus] = useState<Point | null>(null)
  const [activeEvent, setActiveEvent] = useState<number | null>(null)
  const [modal, setModal] = useState<"sources" | "science" | "brief" | null>(
    null,
  )
  const [view, setView] = useState<"routes" | "timeline">("routes")
  const route = routes.find((r) => r.id === selected)!
  const recommendedRoute = routes.find((r) => r.id === recommended)!
  const dirty = JSON.stringify(config) !== JSON.stringify(generatedConfig)
  const setField = (key: keyof MissionConfig, value: string) =>
    setConfig({ ...config, [key]: value })
  const chooseRoute = (id: RouteId) => {
    setSelected(id)
    setActiveEvent(null)
    setFocus(null)
  }
  const generate = async () => {
    if (generating) return
    setGenerating(true)
    const result = await mockMissionProvider.plan({ ...config })
    setRoutes(result.routes)
    setRecommended(result.recommended)
    setSelected(result.recommended)
    setGeneratedConfig(result.config)
    setGenerating(false)
    setGenerated(true)
    setFocus(null)
    setActiveEvent(null)
  }
  const timeline = [
    {
      name: "Depart base",
      time: 0,
      point: route.points[0],
      icon: "pin",
      detail: "Suit check complete",
    },
    {
      name: "Terrain checkpoint",
      time: Math.round(route.minutes * 0.212),
      point: route.points[2],
      icon: "mountain",
      detail: "Assess footing & slope",
    },
    {
      name: `Scientific Target ${route.targets.find((t) => t !== "A") || "A"}`,
      time: Math.round(route.minutes * 0.43),
      point: route.points[Math.floor(route.points.length * 0.45)],
      icon: "target",
      detail: "Observation & sampling",
    },
    {
      name: "Hazard zone",
      time: Math.round(route.minutes * 0.715),
      point: route.points[Math.floor(route.points.length * 0.7)],
      icon: "warning",
      detail: "Controlled traverse",
    },
    {
      name: "Destination",
      time: route.minutes,
      point: route.points[route.points.length - 1],
      icon: "check",
      detail: "Arrive at science target",
    },
  ]
  const selectEvent = (index: number) => {
    setActiveEvent(index)
    setFocus(timeline[index].point)
    setFeature(null)
  }
  const showFeature = (f: MapFeature) => {
    setFeature(f)
    setFocus(null)
  }
  const exportBrief = () => {
    const text = `INTERPLANETARY SURVIVAL GUIDE — MARTIAN MAP\nSIMULATED MISSION BRIEF — NOT FOR OPERATIONAL USE\n\nMission: Marswalk / EVA-01\nStart: ${starts.find((s) => s.id === generatedConfig.start)?.name}\nDestination: Target ${generatedConfig.destination}\nObjective: ${generatedConfig.objective}\nRisk tolerance: ${generatedConfig.risk}\n\nSelected route: ${route.id} — ${route.name}\nRisk: ${route.risk}\nDistance: ${route.distance} km\nEstimated EVA: ${formatTime(route.minutes)}\nScientific value: ${route.science}%\nMaximum slope: ${route.slope}°\nCommunication reliability: ${route.comms}%\n\nTIMELINE\n${timeline.map((t) => `${clockTime(t.time)} ${t.name}`).join("\n")}\n\nAll values are illustrative mock data. NASA datasets are not connected. EVA estimates describe an illustrative outbound mission, not a validated return-to-base safety plan.`
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `EVA-01-route-${route.id}-simulated-brief.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="brand">
          <div className="brand-mark">
            <svg viewBox="0 0 44 44" width="38" height="38">
              <circle
                cx="22"
                cy="22"
                r="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <ellipse
                cx="22"
                cy="22"
                rx="23"
                ry="7"
                transform="rotate(-35 22 22)"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="m16 27 6-13 6 13m-9-5h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <div>
            <strong>
              MARTIAN MAP<span className="brand-period">.</span>
            </strong>
            <span className="brand-sub">INTERPLANETARY SURVIVAL GUIDE</span>
          </div>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <Button className="nav-item active" onClick={() => setModal(null)}>
            <Icon name="route" size={15} />
            Mission planner
          </Button>
          <Button
            className={`nav-item ${modal === "science" ? "active" : ""}`}
            onClick={() => setModal("science")}
          >
            Science catalog
          </Button>
          <Button
            className={`nav-item ${modal === "sources" ? "active" : ""}`}
            onClick={() => setModal("sources")}
          >
            Data sources
            <Icon name="arrow" size={13} />
          </Button>
        </nav>
        <div className="header-right">
          <span className="prototype-badge">SIMULATION MODE</span>
          <div className="sol">
            <span>SOL</span> 128 <i /> <Icon name="signal" size={14} />
            <span>LINK NOMINAL</span>
          </div>
          <div className="avatar">MC</div>
        </div>
      </header>
      <main>
        <section className="page-intro">
          <div>
            <div className="eyebrow intro-eyebrow">
              <span className="status-dot orange" /> SURFACE OPERATIONS{" "}
              <span>/</span> MARS 2026 CONCEPT
            </div>
            <h1>Marswalk Mission Planner</h1>
            <p>More than a map. A better decision for every step on Mars.</p>
          </div>
          <div className="intro-right">
            <div className="mission-id">
              <span className="eyebrow">ACTIVE MISSION</span>
              <strong>
                EVA–01 <span>/</span> JEZERO
              </strong>
            </div>
            <Button
              className="outline-button"
              onClick={() => setModal("brief")}
            >
              <Icon name="download" size={15} />
              Mission brief
            </Button>
          </div>
        </section>
        <div className="mission-workspace">
          <aside className="configuration panel">
            <div className="panel-title">
              <Icon name="route" size={15} />
              <Heading>MISSION CONFIGURATION</Heading>
              <span className="panel-number">01</span>
            </div>
            <div className="configuration-body">
              <div className="mission-field">
                <span className="field-label">MISSION</span>
                <div className="mission-type">
                  <Icon name="crew" size={17} />
                  <strong>Marswalk</strong>
                  <span>EVA–01</span>
                </div>
              </div>
              <div className="location-fields">
                <div className="location-line" />
                <label className="field location-field">
                  <span className="field-label">
                    <span className="location-dot" />
                    START LOCATION
                  </span>
                  <Select
                    value={config.start}
                    onChange={(e) => setField("start", e.target.value)}
                  >
                    {starts.map((s) => (
                      <option value={s.id} key={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="field location-field">
                  <span className="field-label">
                    <span className="location-dot destination-dot" />
                    DESTINATION
                  </span>
                  <Select
                    value={config.destination}
                    onChange={(e) => setField("destination", e.target.value)}
                  >
                    {targets.map((t) => (
                      <option value={t.id} key={t.id}>
                        Target {t.id} · {t.name}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              <label className="field">
                <span className="field-label">
                  MISSION OBJECTIVE <Icon name="info" size={12} />
                </span>
                <Select
                  value={config.objective}
                  onChange={(e) => setField("objective", e.target.value)}
                >
                  {[
                    "Maximum Safety",
                    "Maximum Scientific Value",
                    "Minimum EVA Time",
                    "Balanced Mission",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </label>
              <div className="field">
                <span className="field-label">RISK TOLERANCE</span>
                <div
                  className="segmented"
                  role="group"
                  aria-label="Risk tolerance"
                >
                  {["Low", "Medium", "High"].map((r) => (
                    <Button
                      key={r}
                      className={config.risk === r ? "selected" : ""}
                      onClick={() => setField("risk", r)}
                      aria-pressed={config.risk === r}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="crew-details">
                <div>
                  <Icon name="crew" size={15} />
                  <span>Crew</span>
                  <strong>2 astronauts</strong>
                </div>
                <div>
                  <Icon name="clock" size={15} />
                  <span>EVA budget</span>
                  <strong>6h 00m</strong>
                </div>
              </div>
              <Button
                className="generate-button"
                onClick={generate}
                disabled={generating}
              >
                <Icon
                  name={generating ? "reset" : "route"}
                  size={16}
                  className={generating ? "spin" : ""}
                />
                {generating ? "ANALYZING TERRAIN…" : "GENERATE ROUTES"}
                {!generating && <Icon name="arrow" size={17} />}
              </Button>
              <div
                className={`config-status ${dirty ? "pending" : ""}`}
                aria-live="polite"
              >
                <span className="status-dot" />
                {generating
                  ? "Evaluating mock route candidates"
                  : dirty
                    ? "Configuration changed · regenerate routes"
                    : generated
                      ? "3 routes generated · analysis updated"
                      : "3 candidate routes ready to explore"}
              </div>
            </div>
            <div className="environment">
              <div className="section-label">
                <Icon name="globe" size={13} />
                SURFACE CONDITIONS<span>MOCK</span>
              </div>
              <div className="environment-grid">
                <div>
                  <span>AIR TEMPERATURE</span>
                  <strong>
                    −63<small> °C</small>
                  </strong>
                </div>
                <div>
                  <span>WIND SPEED</span>
                  <strong>
                    8.4<small> m/s</small>
                  </strong>
                </div>
                <div>
                  <span>SURFACE PRESSURE</span>
                  <strong>
                    610<small> Pa</small>
                  </strong>
                </div>
                <div>
                  <span>VISIBILITY</span>
                  <strong>Good</strong>
                </div>
              </div>
              <div className="environment-note">
                <span className="status-dot" />
                No simulated dust event
              </div>
            </div>
            <div className="config-bottom">
              <Icon name="shield" size={16} />
              <span>
                Human judgment. Data-informed.
                <br />
                <strong>Mission control stays in command.</strong>
              </span>
            </div>
          </aside>
          <MarsMap
            routes={routes}
            selected={selected}
            onRoute={chooseRoute}
            start={generatedConfig.start}
            destination={generatedConfig.destination}
            feature={feature}
            onFeature={showFeature}
            focus={focus}
            onStart={(id) => setField("start", id)}
            onDestination={(id) => setField("destination", id)}
          />
          <aside className="intelligence panel">
            <div className="panel-title">
              <Icon name="spark" size={15} />
              <Heading>MISSION INTELLIGENCE</Heading>
              <span className="panel-number">02</span>
            </div>
            <div className="intelligence-body">
              <div className="field-label">MISSION STATUS</div>
              <div className="planning-status">
                <span className="status-dot" />
                {generating
                  ? "ANALYZING ROUTES"
                  : dirty
                    ? "CONFIGURATION UPDATED"
                    : "READY FOR PLANNING"}
              </div>
              <div className="recommendation">
                <div className="recommendation-top">
                  <Icon name="shield" size={14} />
                  <span>RECOMMENDED ROUTE</span>
                  <Icon
                    name="spark"
                    size={13}
                    className="recommendation-stars"
                  />
                </div>
                <div className="recommendation-name">
                  Route {recommended} <span>— {recommendedRoute.name}</span>
                  <Icon name="arrow" size={18} />
                </div>
                <p>
                  {recommended === "B"
                    ? "Best balance between scientific value, terrain risk, and EVA duration."
                    : recommended === "A"
                      ? "Prioritizes stable terrain and reliable communications for a lower-risk traverse."
                      : "Prioritizes a shorter EVA, with a higher terrain-risk trade-off."}
                </p>
              </div>
              <div className="selected-route-label">
                ANALYZING <strong>ROUTE {selected}</strong>
                {selected !== recommended && <span>ALTERNATIVE</span>}
              </div>
              <div className="intelligence-metrics" key={selected}>
                <div>
                  <span>Mission risk</span>
                  <strong className={`risk-${route.id}`}>
                    {route.risk}
                    <span className="risk-bars">
                      <i />
                      <i />
                      <i />
                    </span>
                  </strong>
                </div>
                <div>
                  <span>Scientific yield</span>
                  <strong>
                    {route.science}
                    <small>%</small>
                    <span className="metric-bar">
                      <i style={{ width: `${route.science}%` }} />
                    </span>
                  </strong>
                </div>
                <div>
                  <span>Estimated EVA</span>
                  <strong>{formatTime(route.minutes)}</strong>
                </div>
                <div>
                  <span>Comm. reliability</span>
                  <strong>
                    {route.comms}
                    <small>%</small>
                    <Icon name="signal" size={13} />
                  </strong>
                </div>
              </div>
              <div className="ai-insight">
                <div className="section-label">
                  <Icon name="spark" size={14} />
                  AI MISSION INSIGHT
                </div>
                <p>
                  {selected === "B"
                    ? `Route B adds ${route.minutes - routes.find((r) => r.id === "C")!.minutes} minutes compared with the fastest route, but reaches ${route.targets.length} science targets while avoiding the steepest terrain.`
                    : selected === "A"
                      ? `Route A reduces maximum slope to ${route.slope}° and offers ${route.comms}% simulated relay coverage. Lower terrain risk comes at the cost of scientific yield.`
                      : `Route C saves ${routes.find((r) => r.id === "B")!.minutes - route.minutes} minutes over Route B, but includes steeper slopes and a potential communication gap.`}
                </p>
                <div className="insight-disclaimer">
                  <Icon name="info" size={11} />
                  Illustrative decision support · not a safety clearance
                </div>
              </div>
              <div className="profile-section">
                <div className="section-label">
                  ELEVATION PROFILE<span>ROUTE {selected}</span>
                </div>
                <ElevationChart route={route} />
                <div className="profile-stats">
                  <span>
                    Max slope <strong>{route.slope}°</strong>
                  </span>
                  <span>
                    Terrain <strong>{route.terrain}</strong>
                  </span>
                </div>
              </div>
              <div className="route-encounters">
                <div className="section-label">ON THIS ROUTE</div>
                <div className="encounter-row">
                  <Icon name="target" size={13} />
                  {route.targets.map((id) => (
                    <Button
                      key={id}
                      onClick={() => showFeature({ type: "target", id })}
                    >
                      Target {id}
                      <Icon name="chevron" size={11} />
                    </Button>
                  ))}
                </div>
                <div className="encounter-row warning">
                  <Icon name="warning" size={13} />
                  <Button
                    onClick={() =>
                      showFeature({ type: "hazard", id: route.hazards[0] })
                    }
                  >
                    {hazards.find((h) => h.id === route.hazards[0])?.name}
                    <Icon name="chevron" size={11} />
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
        <section className="route-section">
          <div className="route-section-header">
            <div className="bottom-tabs">
              <Button
                className={view === "routes" ? "active" : ""}
                onClick={() => setView("routes")}
              >
                <Icon name="route" size={15} />
                ROUTE COMPARISON<span>03</span>
              </Button>
              <Button
                className={view === "timeline" ? "active" : ""}
                onClick={() => setView("timeline")}
              >
                <Icon name="clock" size={15} />
                MISSION TIMELINE
              </Button>
            </div>
            <div className="comparison-note">
              <span className="status-dot" />{" "}
              {view === "routes"
                ? "Three routes. Different trade-offs. One informed decision."
                : "Select a checkpoint to locate it on the surface map."}
            </div>
          </div>
          {view === "routes" ? (
            <div className="route-cards">
              {routes.map((r) => (
                <Button
                  key={r.id}
                  className={`route-card route-card-${r.id} ${
                    selected === r.id ? "selected" : ""
                  }`}
                  onClick={() => chooseRoute(r.id)}
                  aria-pressed={selected === r.id}
                >
                  <div className="route-card-top">
                    <span className={`route-letter letter-${r.id}`}>
                      {r.id}
                    </span>
                    <div>
                      <span className="route-card-name">
                        ROUTE {r.id}
                        <span> — {r.name.toUpperCase()}</span>
                      </span>
                      <span className={`route-risk risk-${r.id}`}>
                        <span className="status-dot" />
                        {r.risk} risk
                      </span>
                    </div>
                    {recommended === r.id ? (
                      <span className="recommended-pill">
                        <Icon name="check" size={11} />
                        RECOMMENDED
                      </span>
                    ) : (
                      <span className="route-radio">
                        {selected === r.id && <Icon name="check" size={11} />}
                      </span>
                    )}
                  </div>
                  <div className="route-card-metrics">
                    <div>
                      <span>DISTANCE</span>
                      <strong>
                        {r.distance.toFixed(1)}
                        <small> km</small>
                      </strong>
                    </div>
                    <div>
                      <span>EVA TIME</span>
                      <strong>{formatTime(r.minutes)}</strong>
                    </div>
                    <div>
                      <span>SCIENCE VALUE</span>
                      <strong>
                        {r.science}
                        <small>%</small>
                        <span className={`mini-bar bar-${r.id}`}>
                          <i style={{ width: `${r.science}%` }} />
                        </span>
                      </strong>
                    </div>
                  </div>
                  <div className="route-card-bottom">
                    <span>
                      <Icon name="mountain" size={12} />
                      {r.terrain} terrain difficulty
                    </span>
                    <span>
                      {selected === r.id ? "SELECTED" : "VIEW ROUTE"}
                      <Icon
                        name={selected === r.id ? "check" : "arrow"}
                        size={12}
                      />
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="timeline-detail">
              <div className="timeline-summary">
                <Icon name="clock" size={25} />
                <div>
                  <span className="eyebrow">
                    ROUTE {selected} · PLANNED EVA
                  </span>
                  <strong>{formatTime(route.minutes)}</strong>
                </div>
                <p>
                  {formatTime(360 - route.minutes)} remaining in the
                  illustrative 6-hour budget.
                  <br />
                  <span>
                    Outbound concept only. Return traverse and contingency
                    reserve require separate validation.
                  </span>
                </p>
              </div>
              <div className="timeline-details-events">
                {timeline.map((event, i) => (
                  <Button
                    key={event.name}
                    className={activeEvent === i ? "active" : ""}
                    onClick={() => selectEvent(i)}
                  >
                    <span>{clockTime(event.time)}</span>
                    <Icon name={event.icon} size={19} />
                    <strong>{event.name}</strong>
                    <small>{event.detail}</small>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </section>
        <section className="mission-timeline">
          <div className="timeline-title">
            <Icon name="clock" size={15} />
            <Heading>MISSION TIMELINE</Heading>
            <span>ROUTE {selected}</span>
          </div>
          <div className="timeline-track">
            {timeline.map((event, i) => (
              <Button
                key={event.name}
                className={`timeline-event ${
                  activeEvent === i ? "active" : ""
                }`}
                onClick={() => selectEvent(i)}
                aria-pressed={activeEvent === i}
              >
                <span className="timeline-time">{clockTime(event.time)}</span>
                <span className={`timeline-dot event-${event.icon}`}>
                  <Icon name={event.icon} size={12} />
                </span>
                <strong>{event.name}</strong>
              </Button>
            ))}
          </div>
          <div className="timeline-total">
            <span>EST. DURATION</span>
            <strong>{formatTime(route.minutes)}</strong>
          </div>
        </section>
        <footer className="app-footer">
          <div className="data-source-links">
            <span>FUTURE DATA SOURCES</span>
            {["NASA PDS", "MOLA", "HiRISE", "THEMIS"].map((name) => (
              <Button key={name} onClick={() => setModal("sources")}>
                {name}
                <Icon name="arrow" size={10} />
              </Button>
            ))}
            <span className="footer-source-note">MOCK DATA ACTIVE</span>
          </div>
          <span>
            NASA SPACE APPS CHALLENGE <i /> CONCEPT PROTOTYPE · NOT
            NASA-AFFILIATED
          </span>
        </footer>
      </main>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              modal === "sources"
                ? "Data sources"
                : modal === "science"
                  ? "Science catalog"
                  : "Mission brief"
            }
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setModal(null)
            }}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">MARTIAN MAP / MISSION RESOURCES</span>
                <Heading>
                  {modal === "sources"
                    ? "Data behind the decisions"
                    : modal === "science"
                      ? "Scientific target catalog"
                      : "EVA–01 mission brief"}
                </Heading>
              </div>
              <Button
                autoFocus
                aria-label="Close dialog"
                onClick={() => setModal(null)}
              >
                <Icon name="close" />
              </Button>
            </div>
            {modal === "sources" ? (
              <>
                <p className="modal-intro">
                  All terrain, routes, targets, and environmental values in this
                  prototype are simulated. No live NASA APIs are connected. The
                  mission provider is isolated for future dataset integration.
                </p>
                <div className="source-grid">
                  {sources.map((s) => (
                    <div className="source-item" key={s.name}>
                      <Icon name="layers" size={20} />
                      <strong>{s.name}</strong>
                      <p>{s.description}</p>
                      <span>{s.status}</span>
                    </div>
                  ))}
                </div>
                <div className="modal-notice">
                  <Icon name="info" size={17} />
                  This is an independent Space Apps concept, not a NASA mission
                  system. Future source integration will require provenance,
                  scientific validation, and coordinate registration.
                </div>
              </>
            ) : modal === "science" ? (
              <>
                <p className="modal-intro">
                  Illustrative observation targets in the Jezero mission region.
                  Select a target to inspect it on the map.
                </p>
                <div className="catalog-list">
                  {targets.map((t) => (
                    <Button
                      key={t.id}
                      onClick={() => {
                        setModal(null)
                        showFeature({ type: "target", id: t.id })
                        setFocus({ x: t.x, y: t.y })
                      }}
                    >
                      <span className="catalog-icon">
                        <Icon name="target" />
                      </span>
                      <div>
                        <strong>
                          Target {t.id} — {t.name}
                        </strong>
                        <span>
                          {t.type} · {t.time} min observation
                        </span>
                      </div>
                      <span className="catalog-interest">
                        {t.interest} interest
                      </span>
                      <Icon name="chevron" />
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="brief-banner">
                  <Icon name="route" size={24} />
                  <div>
                    <strong>
                      Route {selected} — {route.name}
                    </strong>
                    <span>
                      {selected === recommended
                        ? "Recommended route"
                        : "Selected alternative"}{" "}
                      · {generatedConfig.objective}
                    </span>
                  </div>
                  <span className="prototype-badge">SIMULATED</span>
                </div>
                <div className="brief-metrics">
                  <div>
                    <span>Distance</span>
                    <strong>{route.distance} km</strong>
                  </div>
                  <div>
                    <span>EVA duration</span>
                    <strong>{formatTime(route.minutes)}</strong>
                  </div>
                  <div>
                    <span>Scientific yield</span>
                    <strong>{route.science}%</strong>
                  </div>
                  <div>
                    <span>Risk</span>
                    <strong>{route.risk}</strong>
                  </div>
                </div>
                <div className="brief-events">
                  {timeline.map((e) => (
                    <div key={e.name}>
                      <span>{clockTime(e.time)}</span>
                      <strong>{e.name}</strong>
                      <small>{e.detail}</small>
                    </div>
                  ))}
                </div>
                <div className="modal-notice">
                  <Icon name="warning" size={17} />
                  Illustrative outbound route only. Not validated for astronaut
                  operations. Return-to-base, suit limits, and contingency
                  reserves must be assessed separately.
                </div>
                <Button className="generate-button" onClick={exportBrief}>
                  <Icon name="download" size={16} />
                  DOWNLOAD SIMULATED BRIEF
                  <Icon name="arrow" size={16} />
                </Button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
