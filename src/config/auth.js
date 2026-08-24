// Authentication is temporarily opt-in so the UI can run without the backend.
// Set VITE_AUTH_ENABLED=true when the auth service is available again.
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "false";
