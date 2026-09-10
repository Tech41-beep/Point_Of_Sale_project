
// Vite replaces environment variables at build time.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const apiUrl = import.meta.env.PROD
  ? "https://api.lovkimtech.store"
  : (configuredApiUrl || `http://${window.location.hostname}:8000`);
