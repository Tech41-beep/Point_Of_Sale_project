
// Vite replaces environment variables at build time. Keep localhost for local
// development, but never send visitors on the deployed site to their own PC.
export const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://api.lovkimtech.store"
    : "http://localhost:8000");
