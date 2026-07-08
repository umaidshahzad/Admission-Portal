import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Program, Application, GlobalSettings } from '../types.ts';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  programs: Program[];
  applications: Application[];
  myApplications: Application[];
  currentRoute: string;
  globalSettings: GlobalSettings;
  isLoading: boolean;
  toasts: Toast[];
  setRoute: (route: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  login: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchPrograms: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchMyApplications: () => Promise<void>;
  submitApplication: (formData: FormData) => Promise<boolean>;
  verifyApplication: (appId: string, status: string, comments: string) => Promise<boolean>;
  saveTestScore: (appId: string, obtainedMarks: number, isAttended: boolean) => Promise<boolean>;
  generateMeritList: (programId: string) => Promise<boolean>;
  
  // Admin & Staff CRUD Helpers
  createUser: (userData: any) => Promise<boolean>;
  updateUser: (userId: string, userData: any) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  createProgram: (programData: any) => Promise<boolean>;
  updateProgram: (programId: string, programData: any) => Promise<boolean>;
  deleteProgram: (programId: string) => Promise<boolean>;
  
  // Global Override
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admissions_token'));
  const [programs, setPrograms] = useState<Program[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    admissionsOpen: true,
    deadline: '2026-08-31',
    announcement: 'University admissions for Autumn 2026 are officially open! Submit your academic transcript and prepare for entrance exams.'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Run on mount to authenticate token
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
            // Route logged in user to their dashboard automatically
            if (currentRoute === 'home' || currentRoute === 'login' || currentRoute === 'register') {
              setCurrentRoute('dashboard');
            }
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error('Auth verification error:', err);
          logout();
        } finally {
          setIsLoading(false);
        }
      }
    };
    initAuth();
    fetchPrograms();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admissions_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        setCurrentRoute('dashboard');
        return true;
      } else {
        showToast(data.message || 'Invalid email or password.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Connection to server failed.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admissions_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showToast('Registration successful! Welcome to the admissions portal.', 'success');
        setCurrentRoute('dashboard');
        return true;
      } else {
        showToast(data.message || 'Registration failed.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Connection to server failed.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admissions_token');
    setToken(null);
    setUser(null);
    setMyApplications([]);
    setApplications([]);
    showToast('Logged out successfully.', 'info');
    setCurrentRoute('home');
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (res.ok) {
        setPrograms(data.programs);
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
  };

  const fetchMyApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/applications/my-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMyApplications(data.applications);
      }
    } catch (err) {
      console.error('Error fetching my applications:', err);
    }
  };

  const fetchApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Error fetching total applications:', err);
    }
  };

  const submitApplication = async (formData: FormData): Promise<boolean> => {
    if (!token) return false;
    setIsLoading(true);
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData // Multer handles multipart/form-data
      });
      
      const responseText = await res.text();
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Response was not JSON:', responseText);
        showToast(`Server error (Status ${res.status}): ${responseText.substring(0, 100)}...`, 'error');
        return false;
      }

      if (res.ok) {
        showToast('Admission application submitted successfully!', 'success');
        fetchMyApplications();
        return true;
      } else {
        showToast(data.message || 'Failed to submit application.', 'error');
        return false;
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      showToast(`Error uploading files: ${err.message || err}`, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyApplication = async (appId: string, status: string, comments: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/applications/${appId}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, comments })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Application successfully: ${status}`, 'success');
        fetchApplications();
        return true;
      } else {
        showToast(data.message || 'Action failed.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error communicating with server.', 'error');
      return false;
    }
  };

  const saveTestScore = async (appId: string, obtainedMarks: number, isAttended: boolean): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/applications/${appId}/test-scores`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ obtainedMarks, isAttended })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Entry test marks recorded and aggregate updated.', 'success');
        fetchApplications();
        return true;
      } else {
        showToast(data.message || 'Failed to record test marks.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error recording entry test score.', 'error');
      return false;
    }
  };

  const generateMeritList = async (programId: string): Promise<boolean> => {
    if (!token) return false;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/applications/generate-merit-list/${programId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Merit list compiled and locked successfully!', 'success');
        fetchApplications();
        return true;
      } else {
        showToast(data.message || 'Could not compile merit list.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Server error while generating merit list.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // STAFF & ADMIN ACCOUNTS CRUD
  // ==========================================
  const createUser = async (userData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Staff member ${userData.name} created!`, 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to create user account.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error registering staff member.', 'error');
      return false;
    }
  };

  const updateUser = async (userId: string, userData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('User account updated successfully.', 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to update user account.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error editing user details.', 'error');
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Account successfully terminated.', 'success');
        return true;
      } else {
        showToast(data.message || 'Failed to terminate account.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error terminating account.', 'error');
      return false;
    }
  };

  // ==========================================
  // DEGREE PROGRAM CRUD
  // ==========================================
  const createProgram = async (programData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(programData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Academic program: ${programData.name} created!`, 'success');
        fetchPrograms();
        return true;
      } else {
        showToast(data.message || 'Failed to create program.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error creating program.', 'error');
      return false;
    }
  };

  const updateProgram = async (programId: string, programData: any): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(programData)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Program updated successfully!', 'success');
        fetchPrograms();
        return true;
      } else {
        showToast(data.message || 'Failed to update program.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error editing program details.', 'error');
      return false;
    }
  };

  const deleteProgram = async (programId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Program deleted successfully.', 'success');
        fetchPrograms();
        return true;
      } else {
        showToast(data.message || 'Failed to delete program.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Error deleting program.', 'error');
      return false;
    }
  };

  const updateGlobalSettings = (settings: Partial<GlobalSettings>) => {
    setGlobalSettings((prev) => ({ ...prev, ...settings }));
    showToast('Global configurations updated.', 'success');
  };

  const setRoute = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        programs,
        applications,
        myApplications,
        currentRoute,
        globalSettings,
        isLoading,
        toasts,
        setRoute,
        showToast,
        removeToast,
        login,
        registerUser,
        logout,
        fetchPrograms,
        fetchApplications,
        fetchMyApplications,
        submitApplication,
        verifyApplication,
        saveTestScore,
        generateMeritList,
        createUser,
        updateUser,
        deleteUser,
        createProgram,
        updateProgram,
        deleteProgram,
        updateGlobalSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
