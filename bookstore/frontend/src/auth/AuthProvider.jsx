import { createContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getAuthChangedEventName,
  loadToken,
  loadUser,
  saveSession as saveSessionToStorage,
} from "../utils/storage";
import { authApi } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => loadToken());
  const [user, setUser] = useState(() => loadUser());
  const [isAuthReady, setIsAuthReady] = useState(() => {
    const initialToken = loadToken();
    const initialUser = loadUser();
    return !initialToken || Boolean(initialUser);
  });

  useEffect(() => {
    const syncSession = () => {
      const nextToken = loadToken();
      const nextUser = loadUser();
      setToken(nextToken);
      setUser(nextUser);
      setIsAuthReady(!nextToken || Boolean(nextUser));
    };

    const authChangedEvent = getAuthChangedEventName();
    window.addEventListener(authChangedEvent, syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener(authChangedEvent, syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  useEffect(() => {
    if (!token || user) {
      setIsAuthReady(true);
      return;
    }

    let isMounted = true;
    setIsAuthReady(false);

    async function refreshCurrentUser() {
      try {
        const response = await authApi.getMe();
        if (!isMounted) {
          return;
        }

        const currentUser = response.data || null;
        saveSessionToStorage(token, currentUser);
        setUser(currentUser);
        setIsAuthReady(true);
      } catch {
        if (!isMounted) {
          return;
        }

        clearSession();
        setToken(null);
        setUser(null);
        setIsAuthReady(true);
      }
    }

    refreshCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthReady,
      isAuthenticated: Boolean(token),
      saveSession(authPayload) {
        saveSessionToStorage(authPayload.token, authPayload.user);
        setToken(authPayload.token);
        setUser(authPayload.user);
        setIsAuthReady(true);
      },
      logout() {
        clearSession();
        setToken(null);
        setUser(null);
        setIsAuthReady(true);
      },
      hasRole(roleName) {
        return user?.roles?.includes(roleName) || false;
      },
    }),
    [isAuthReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
