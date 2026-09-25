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
  refreshUserData: () => Promise<void>;
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
      
      // Check for existing session
      const storedUser = localStorage.getItem('OHCEA_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          if (parsedUser.id) {
            fetchNotifications(parsedUser.id);
          }
        } catch (e) {
          localStorage.removeItem('OHCEA_user');
        }
      }
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
      localStorage.setItem('OHCEA_user', JSON.stringify(data.user));
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

  const refreshUserData = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/members/${currentUser.id}`);
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        localStorage.setItem('OHCEA_user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('OHCEA_user');
  };

  // Auto-logout after 15 minutes of inactivity
  useEffect(() => {
    let inactivityTimer: number;

    const resetTimer = () => {
      window.clearTimeout(inactivityTimer);
      if (currentUser) {
        inactivityTimer = window.setTimeout(() => {
          logout();
          alert("Session expired: You have been automatically logged out due to 15 minutes of inactivity.");
          window.location.href = '/login';
        }, 15 * 60 * 1000); // 15 minutes
      }
    };

    if (currentUser) {
      resetTimer();
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
      // Use passive listeners for better performance on scroll/touch
      events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

      return () => {
        window.clearTimeout(inactivityTimer);
        events.forEach(e => window.removeEventListener(e, resetTimer));
      };
    }
  }, [currentUser]);

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
        refreshUserData,
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
