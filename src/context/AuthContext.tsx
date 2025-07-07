import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  voterId: string;
  isAdmin?: boolean;
  hasVoted?: boolean;
  isEmailVerified?: boolean;
  isAdminApproved?: boolean;
  canVote?: boolean;
  rejectionReason?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  checkApprovalStatus: () => Promise<void>;
  approvalStatus: {
    isEmailVerified: boolean;
    isAdminApproved: boolean;
    canVote: boolean;
    rejectionReason?: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<{
    isEmailVerified: boolean;
    isAdminApproved: boolean;
    canVote: boolean;
    rejectionReason?: string;
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('jwt-token');
    
    if (storedUser && token) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check approval status if user is not admin
      if (!userData.isAdmin) {
        checkApprovalStatus();
      }
    }
  }, []);

  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem('jwt-token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/approval-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApprovalStatus(data.data);
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Check approval status for non-admin users
    if (!userData.isAdmin) {
      checkApprovalStatus();
    }
  };

  const logout = () => {
    setUser(null);
    setApprovalStatus(null);
    localStorage.removeItem('user');
    localStorage.removeItem('jwt-token');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    checkApprovalStatus,
    approvalStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};