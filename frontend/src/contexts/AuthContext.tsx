import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RegisterData } from '../types/user';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: (User & { token: string }) | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ token: string; user: User }>;
  register: (data: RegisterData) => Promise<{ message: string }>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Validate API URL
const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  console.error('REACT_APP_API_URL is not defined in environment variables');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { token: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to validate token
  const validateToken = async (token: string) => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${API_URL}/api/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.token) {
            // Validate the token
            const validatedUser = await validateToken(parsedUser.token);
            if (validatedUser) {
              setUser(parsedUser);
              setIsAuthenticated(true);
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('user');
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const userData = { ...data.user, token: data.token };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      return { token: data.token, user: data.user };
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'Server returned non-JSON response') {
        toast.error('Unable to connect to the server. Please try again later.');
      } else {
        toast.error(error.message || 'Login failed. Please check your credentials.');
      }
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }

      return responseData;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message === 'Server returned non-JSON response') {
        toast.error('Unable to connect to the server. Please try again later.');
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    // Optionally call logout endpoint to invalidate token on server
    if (API_URL && user?.token) {
      fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        console.error('Logout error:', error);
      });
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 