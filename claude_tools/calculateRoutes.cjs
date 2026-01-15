/**
 * Script to pre-calculate walking routes using OSRM
 * Run with: node claude_tools/calculateRoutes.js
 *
 * This will fetch real walking routes from OSRM and save them to routes.json
 * so we don't need to call the API at runtime.
 */

const fs = require('fs');
const path = require('path');

// Load data
const soundPoints = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/soundPoints.json'), 'utf8'));
const routes = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/routes.json'), 'utf8'));

// OSRM demo server (for one-time calculation only)
const OSRM_URL = 'https://router.project-osrm.org/route/v1/foot';

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

    // Get points for this route
    const routePoints = soundPoints.filter(p => p.routes.includes(route.id));

    if (routePoints.length < 2) {
      console.log(`  Skipping - only ${routePoints.length} points`);
      updatedRoutes.push({ ...route, geometry: null });
      continue;
    }

    console.log(`  Found ${routePoints.length} points`);

    // Sort points by some logic if needed (for now, use as-is)
    // In a real scenario, you might want to optimize the order

    // Create coordinates array [lon, lat] for OSRM
    const coordinates = routePoints.map(p => [p.longitude, p.latitude]);

    try {
      const geometry = await fetchRoute(coordinates);
      console.log(`  Route calculated: ${geometry.length} coordinates`);

      // Convert from [lon, lat] to [lat, lon] for Leaflet
      const leafletGeometry = geometry.map(([lon, lat]) => [lat, lon]);

      updatedRoutes.push({
        ...route,
        geometry: leafletGeometry,
        pointIds: routePoints.map(p => p.id)
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
