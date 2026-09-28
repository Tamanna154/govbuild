import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : {
      id: 'demo-superadmin-id',
      name: 'Shri Rajesh Patel',
      email: 'admin@rnb.gujarat.gov.in',
      role: 'SUPER_ADMIN',
      designation: 'Chief Engineer & Technical Secretary',
      department: 'Roads & Buildings Department'
    };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token') || 'demo-jwt-token');

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err: any) {
      console.warn('Falling back to local auth state for demo:', err);
      const demoUser: User = {
        id: 'demo-user-id',
        name: email.split('@')[0].toUpperCase(),
        email,
        role: email.includes('admin') ? 'SUPER_ADMIN' : email.includes('inspector') ? 'INSPECTOR' : 'ENGINEER',
        designation: 'R&B Department Officer',
        department: 'Roads & Buildings Department'
      };
      setUser(demoUser);
      setToken('demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const switchRole = (newRole: Role) => {
    if (!user) return;
    const roleNames: Record<Role, { name: string; desig: string }> = {
      SUPER_ADMIN: { name: 'Shri Rajesh Patel', desig: 'Chief Engineer & Technical Secretary' },
      DEPT_ADMIN: { name: 'Er. Suresh Mehta', desig: 'Superintending Engineer (E&M)' },
      ENGINEER: { name: 'Er. Vikram Shah', desig: 'Executive Engineer (Mechanical)' },
      INSPECTOR: { name: 'Dipak Parmar', desig: 'Senior Quality Inspector' },
      TECHNICIAN: { name: 'Mahesh Solanki', desig: 'Senior Electrical Technician' },
      VIEWER: { name: 'Smt. Anjali Joshi', desig: 'Additional Chief Secretary (Monitoring)' }
    };
    const updatedUser: User = {
      ...user,
      role: newRole,
      name: roleNames[newRole]?.name || user.name,
      designation: roleNames[newRole]?.desig || user.designation
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
