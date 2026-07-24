import { createContext, useEffect, useState } from "react";
import authService from "../../features/auth/services/auth.service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (active) {
          setUser(storedUser ? JSON.parse(storedUser) : null);
        }
      } catch {
        if (active) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = (userProfile) => {
    setUser(userProfile);
    localStorage.setItem("user", JSON.stringify(userProfile));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
