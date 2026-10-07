# Mission data boundary

`mission.ts` contains the illustrative Jezero locations, target observations,
hazards, route metrics, and a `MissionDataProvider` contract. The UI consumes
the `MissionResult` returned by that provider; replace `mockMissionProvider`
with a validated analysis provider when real datasets are available.

The current provider deliberately does not call NASA APIs. It adjusts mock
route geometry and traverse duration when endpoints change, then applies a
simple objective/risk policy. Scientific scores, hazard classifications,
communication coverage, and EVA estimates are illustrative, not operational.

Future integrations can use MOLA for elevation, HiRISE for terrain context,
THEMIS for thermal context, NASA PDS and rover archives for science records,
and Earthdata discovery where applicable. Raster and vector sources must be
registered to a shared Mars coordinate reference system before route analysis.
Retain source provenance, resolution, acquisition dates, uncertainty, and
licensing metadata.

`components/Terrain.tsx` renders deterministic synthetic relief. Its local
pixel coordinates are not geographic coordinates, even though the UI labels
the real Jezero region. Replace this renderer and register the overlays when
introducing geographic raster data.

The EVA concept is an illustrative outbound traverse. Return travel, suit
constraints, communication models, environmental forecasts, and contingency
reserves are not validated here. The interface must not be used for real
astronaut navigation or safety decisions.
