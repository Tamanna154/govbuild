import React, { createContext, useContext, useState } from 'react';
import { User, Role } from '../types';
import api from '../api/client';

export const DEMO_PERSONAS: Record<Role, User> = {
  SUPER_ADMIN: {
    id: 'demo-superadmin-id',
    name: 'Shri Rajesh Patel',
    email: 'admin@rnb.gujarat.gov.in',
    role: 'SUPER_ADMIN',
    designation: 'Chief Engineer & Technical Secretary',
    department: 'Roads & Buildings Department, Gujarat'
  },
  DEPT_ADMIN: {
    id: 'demo-deptadmin-id',
    name: 'Er. Suresh Mehta',
    email: 'dept.admin@rnb.gujarat.gov.in',
    role: 'DEPT_ADMIN',
    designation: 'Superintending Engineer (E&M)',
    department: 'Electrical & Mechanical Wing'
  },
  ENGINEER: {
    id: 'demo-engineer-id',
    name: 'Er. Vikram Shah',
    email: 'engineer@rnb.gujarat.gov.in',
    role: 'ENGINEER',
    designation: 'Executive Engineer (Mechanical & Civil)',
    department: 'Roads & Buildings Department, Gujarat'
  },
  INSPECTOR: {
    id: 'demo-inspector-id',
    name: 'Dipak Parmar',
    email: 'inspector@rnb.gujarat.gov.in',
    role: 'INSPECTOR',
    designation: 'Senior Field Safety & Quality Inspector',
    department: 'Quality & Safety Audit Wing'
  },
  TECHNICIAN: {
    id: 'demo-technician-id',
    name: 'Mahesh Solanki',
    email: 'technician@rnb.gujarat.gov.in',
    role: 'TECHNICIAN',
    designation: 'Lead Maintenance Contractor',
    department: 'Electrical & Mechanical Maintenance'
  },
  VIEWER: {
    id: 'demo-viewer-id',
    name: 'Smt. Anjali Joshi',
    email: 'viewer@rnb.gujarat.gov.in',
    role: 'VIEWER',
    designation: 'Additional Chief Secretary (Monitoring)',
    department: 'State Oversight & Planning'
  },
  CITIZEN: {
    id: 'demo-citizen-id',
    name: 'Aarav Mehta',
    email: 'citizen@gujarat.gov.in',
    role: 'CITIZEN',
    designation: 'Civil Resident / Citizen',
    department: 'Public Citizen Portal'
  }
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  loginAsRole: (role: Role) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || null;
  });

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const receivedToken = res.data.token;
      const receivedUser = res.data.user;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
    } catch (err: any) {
      console.warn('Backend login fallback to local persona:', err);
      // Map email to demo persona
      let role: Role = 'SUPER_ADMIN';
      if (email.includes('citizen')) role = 'CITIZEN';
      else if (email.includes('inspector')) role = 'INSPECTOR';
      else if (email.includes('technician')) role = 'TECHNICIAN';
      else if (email.includes('engineer')) role = 'ENGINEER';
      else if (email.includes('viewer')) role = 'VIEWER';
      else if (email.includes('dept')) role = 'DEPT_ADMIN';

      const persona = DEMO_PERSONAS[role] || DEMO_PERSONAS.SUPER_ADMIN;
      setUser(persona);
      setToken('demo-token');
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(persona));
    }
  };

  const loginAsRole = (role: Role) => {
    const persona = DEMO_PERSONAS[role] || DEMO_PERSONAS.SUPER_ADMIN;
    setUser(persona);
    setToken('demo-role-token');
    localStorage.setItem('token', 'demo-role-token');
    localStorage.setItem('user', JSON.stringify(persona));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    const persona = DEMO_PERSONAS[newRole];
    if (persona) {
      setUser(persona);
      localStorage.setItem('user', JSON.stringify(persona));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginAsRole, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
