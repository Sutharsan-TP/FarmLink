import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";

const TOKEN_KEY = "farmsafe_token";
const USER_KEY = "farmsafe_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (storedToken) setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.warn("Failed to restore auth session:", err?.message);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  async function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    await SecureStore.setItemAsync(TOKEN_KEY, nextToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
  }

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    if (response.data?.success) {
      await persist(response.data.token, response.data.user);
    }
    return response.data;
  }

  async function register(name, email, password, role) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    if (response.data?.success) {
      await persist(response.data.token, response.data.user);
    }
    return response.data;
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, initializing, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
