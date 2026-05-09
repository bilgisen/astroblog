const API_URL = import.meta.env.PAYLOAD_API_URL;

/**
 * Fetch data from the Payload CMS API.
 * @param endpoint - The API endpoint path, e.g. "/api/posts"
 * @returns Parsed JSON response
 */
export async function fetchFromPayload(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
  return res.json();
}
