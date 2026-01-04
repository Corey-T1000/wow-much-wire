/**
 * Client ID management for local-only mode.
 * Generates a unique client ID stored in localStorage.
 * Used to associate diagram snapshots with this browser/device.
 */

const CLIENT_ID_KEY = "wireviz-client-id";

/**
 * Get the client ID, generating one if it doesn't exist.
 * This runs on the client side only.
 */
export function getClientId(): string {
  if (typeof window === "undefined") {
    throw new Error("getClientId must be called on the client side");
  }

  let clientId = localStorage.getItem(CLIENT_ID_KEY);

  if (!clientId) {
    // Generate a new client ID
    clientId = `client-${crypto.randomUUID()}`;
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  return clientId;
}

/**
 * Clear the client ID (for testing or reset purposes)
 */
export function clearClientId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CLIENT_ID_KEY);
}
