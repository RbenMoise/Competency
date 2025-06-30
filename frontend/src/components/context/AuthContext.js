import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000"
        }/api/auth/me`,
        { withCredentials: true }
      );
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:4000"
        }/api/auth/login`,
        credentials,
        { withCredentials: true }
      );
      await fetchUser(); // Refresh user data
      return res.data.user;
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
