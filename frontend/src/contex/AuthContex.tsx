import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Userme } from '../Types/User';
import API from '../api/Api'; 

type AuthContextType = {
  user: Userme | null;
  setUser: React.Dispatch<React.SetStateAction<Userme | null>>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Userme | null>(null);
  const [loading, setLoading] = useState(true); 
  // const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await API.get<Userme>("/auth/me");
      setUser(res.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setUser(null);
      } else {
        console.error("Error fetching user:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
