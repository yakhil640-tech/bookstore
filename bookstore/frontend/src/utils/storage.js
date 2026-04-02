export const STORAGE_KEYS = {
  token: "bookstore_token",
  user: "bookstore_user",
  sessionVersion: "bookstore_session_version",
};

const AUTH_CHANGED_EVENT = "bookstore-auth-changed";
const CURRENT_SESSION_VERSION = "3";

function hasCurrentSessionVersion() {
  return localStorage.getItem(STORAGE_KEYS.sessionVersion) === CURRENT_SESSION_VERSION;
}

function clearSessionStorageSilently() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.sessionVersion);
}

function decodeJwtPayload(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function hasExpiredToken(token) {
  const payload = decodeJwtPayload(token);
  const expirySeconds = payload?.exp;

  if (typeof expirySeconds !== "number") {
    return true;
  }

  return expirySeconds * 1000 <= Date.now();
}

function hasValidStoredSession() {
  if (!hasCurrentSessionVersion()) {
    return false;
  }

  const token = localStorage.getItem(STORAGE_KEYS.token);
  const user = localStorage.getItem(STORAGE_KEYS.user);

  if (!token || !user) {
    return false;
  }

  return !hasExpiredToken(token);
}

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function saveSession(token, user) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.sessionVersion, CURRENT_SESSION_VERSION);
  notifyAuthChange();
}

export function loadToken() {
  if (!hasValidStoredSession()) {
    clearSessionStorageSilently();
    return null;
  }

  return localStorage.getItem(STORAGE_KEYS.token);
}

export function loadUser() {
  if (!hasValidStoredSession()) {
    clearSessionStorageSilently();
    return null;
  }

  const value = localStorage.getItem(STORAGE_KEYS.user);
  if (!value) {
    clearSessionStorageSilently();
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    clearSessionStorageSilently();
    return null;
  }
}

export function clearSession() {
  clearSessionStorageSilently();
  notifyAuthChange();
}

export function getAuthChangedEventName() {
  return AUTH_CHANGED_EVENT;
}
