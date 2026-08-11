import React, { createContext, useContext, useState, useEffect } from 'react';
import { Member, AssociationSettings, AppNotification } from '../types';

interface AuthContextType {
  currentUser: Member | null;
  setCurrentUser: (user: Member | null) => void;
  token: string | null;
  settings: AssociationSettings | null;
  notifications: AppNotification[];
  refreshNotifications: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  login: (email: string, password?: string) => Promise<Member | null>;
  logout: () => void;
  switchUserRole: (email: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<AssociationSettings | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const fetchNotifications = async (memberId: string) => {
    try {
      const res = await fetch(`/api/notifications/${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchSettings();
      // Ensure user starts logged out on reload so login page is presented first
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('hcea_user');
      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, password?: string): Promise<Member | null> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password || 'password123' })
      });

      if (!res.ok) return null;

      const data = await res.json();
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('hcea_user', JSON.stringify(data.user));
      fetchNotifications(data.user.id);
      return data.user;
    } catch (err) {
      console.error("Login failed:", err);
      return null;
    }
  };

  const switchUserRole = async (email: string) => {
    await login(email);
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('hcea_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        token,
        settings,
        notifications,
        refreshNotifications: async () => {
          if (currentUser) await fetchNotifications(currentUser.id);
        },
        refreshSettings: fetchSettings,
        login,
        logout,
        switchUserRole,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
