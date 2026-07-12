/**
 * Safely parses JSON from a string, returning a default value if it fails.
 */
export function safeParseJson(text: string, defaultValue: any): any {
  if (!text) return defaultValue;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("safeParseJson failed to parse, using default value. Raw text was:", text.substring(0, 200));
    return defaultValue;
  }
}

/**
 * Perform a fetch, ensuring that no network or parsing error can crash the app.
 * Always resolves, never rejects.
 */
export async function safeFetchJson(url: string, options?: RequestInit, defaultValue: any = []): Promise<any> {
  try {
    const updatedOptions: RequestInit = options ? { ...options } : {};
    const token = typeof window !== "undefined" ? localStorage.getItem("gatekaru_token") : null;
    
    if (token) {
      const headers = new Headers(updatedOptions.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      updatedOptions.headers = headers;
    }

    const response = await fetch(url, updatedOptions);
    const text = await response.text();
    
    // Check if response contains an error, is empty, or HTML
    const trimmed = text.trim();
    if (
      trimmed.startsWith("<!doctype html") || 
      trimmed.startsWith("<html") || 
      trimmed.includes("Rate exceeded") ||
      trimmed === "Rate exceeded." ||
      response.status === 429
    ) {
      console.warn(`safeFetchJson received non-JSON or rate-limited response from ${url}:`, trimmed.substring(0, 100));
      return defaultValue;
    }
    
    return safeParseJson(text, defaultValue);
  } catch (err: any) {
    // Log network/fetch failures as warnings since they are gracefully handled transient states (e.g. during server restart)
    if (err && (err.message === "Failed to fetch" || err.name === "TypeError")) {
      console.warn(`safeFetchJson: Transient network connection issue for ${url} (handled gracefully):`, err.message || err);
    } else {
      console.error(`safeFetchJson failed for ${url}:`, err);
    }
    return defaultValue;
  }
}
