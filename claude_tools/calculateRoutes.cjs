/**
 * Script to pre-calculate walking routes using OSRM
 * Run with: node claude_tools/calculateRoutes.cjs
 *
 * Uses the exact waypoint order from the original Base44 app.
 */

const fs = require('fs');
const path = require('path');

// Load data
const routes = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/routes.json'), 'utf8'));

// OSRM demo server (for one-time calculation only)
const OSRM_URL = 'https://router.project-osrm.org/route/v1/foot';

// Exact waypoint orders from original Base44 app (captured from network requests)
// Format: [longitude, latitude] pairs in walking order
const ROUTE_WAYPOINTS = {
  acoustic_friendly: [
    [-2.9573016426213523, 43.27346390826821],   // Parque de Sarriko
    [-2.9582670743105637, 43.275364375905454],  // Plaza de Ibarrekolanda
    [-2.961511485826854, 43.27694294762451],    // Parque Astigarraga
    [-2.9601139477879066, 43.278599154919796],  // Plaza Valle de Baztan
    [-2.9573016426213523, 43.279956],           // Calle Antxeta
    [-2.9623057766230305, 43.28202767008329]    // Plaza Levante
  ],
  climate_refuge: [
    [-2.9573016426213523, 43.27346390826821],   // Parque de Sarriko
    [-2.9613750324466186, 43.27446179999002],   // Jardines Sta. Maria Josefa Sancho
    [-2.961511485826854, 43.27694294762451],    // Parque Astigarraga
    [-2.9573016426213523, 43.279956],           // Calle Antxeta
    [-2.965595661281431, 43.28476650392853]     // Parque de Elorrieta
  ],
  sound_identity: [
    [-2.9582670743105637, 43.275364375905454],  // Plaza de Ibarrekolanda
    [-2.956641348736805, 43.27711209685057],    // Plaza Celestino Maria del Arenal
    [-2.962298318952517, 43.27820255747088],    // Frontón de San Inazio
    [-2.9601139477879066, 43.278599154919796],  // Plaza Valle de Baztan
    [-2.9623057766230305, 43.28202767008329]    // Plaza Levante
  ]
};

async function fetchRoute(coordinates) {
  // coordinates format: [[lon, lat], [lon, lat], ...]
  const coordString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
  const url = `${OSRM_URL}/${coordString}?overview=full&geometries=geojson`;

  console.log(`Fetching route with ${coordinates.length} waypoints...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OSRM error: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 'Ok') {
    throw new Error(`OSRM error: ${data.code}`);
  }

  // Return the route geometry (array of [lon, lat] coordinates)
  return data.routes[0].geometry.coordinates;
}

async function calculateRoutesForAll() {
  const updatedRoutes = [];

  for (const route of routes) {
    console.log(`\nProcessing route: ${route.name_es}`);

    const waypoints = ROUTE_WAYPOINTS[route.id];

    if (!waypoints || waypoints.length < 2) {
      console.log(`  No waypoints defined for ${route.id}`);
      updatedRoutes.push({ ...route, geometry: null });
      continue;
    }

    console.log(`  Using ${waypoints.length} waypoints in correct order`);

    try {
      const geometry = await fetchRoute(waypoints);
      console.log(`  Route calculated: ${geometry.length} coordinates`);

      // Convert from [lon, lat] to [lat, lon] for Leaflet
      const leafletGeometry = geometry.map(([lon, lat]) => [lat, lon]);

      // Remove old geometry and pointIds, add new geometry
      const { geometry: _oldGeo, pointIds: _oldIds, ...routeData } = route;
      updatedRoutes.push({
        ...routeData,
        geometry: leafletGeometry
      });
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      updatedRoutes.push({ ...route, geometry: null });
    }

    // Small delay to be nice to the demo server
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save updated routes
  const outputPath = path.join(__dirname, '../src/data/routes.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedRoutes, null, 2));
  console.log(`\nSaved to ${outputPath}`);
}

calculateRoutesForAll().catch(console.error);
