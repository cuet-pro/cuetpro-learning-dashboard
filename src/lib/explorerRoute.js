/* Shared module-scope state for the DU Explorer embed route.

   The DU Admissions Explorer lives in its own app (repo cuet-pro/Cuet-pro-du),
   embedded full-bleed in Explorer.jsx. Its tabs are real routes:
     /cutoffs             → "Cutoffs & Seats"
     /subject-combination → "Subject Combination"

   Dashboard widgets need to deep-link straight into a specific tab BEFORE the
   Explorer page mounts, so we hold the pending route here (module scope survives
   tab switches, like the old `lastRoute` did) and let Explorer read it on mount. */

let lastRoute = '/'

export function setExplorerRoute(route) {
  lastRoute = (typeof route === 'string' && route) ? route : '/'
}

export function getExplorerRoute() {
  return lastRoute
}