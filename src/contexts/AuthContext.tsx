import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, saveToken, clearToken } from "../utils/tokenStorage";

const AuthContext = createContext({
  token: null,
  isAuthenticated: false,
  setAuthToken: (token: string) => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const setAuthToken = async (newToken: string) => {
    await saveToken(newToken);
    setToken(newToken);
    console.log("Token actualizado:");
  };

  const logout = async () => {
    await clearToken();
    setToken(null);
  };

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await getToken();
      setToken(storedToken);
    };
    fetchToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        setAuthToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);