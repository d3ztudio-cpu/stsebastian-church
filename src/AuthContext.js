import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const trimmedEmail = (user.email || '').trim();
        const ownerEmail = 'd3ztudio@gmail.com';
        // Check if owner or admin
        const isOwner = trimmedEmail.toLowerCase() === ownerEmail;
        if (isOwner) {
          setIsAdmin(true);
        } else {
          // Check site_admins collection
          try {
            const adminDoc = await getDoc(doc(db, 'site_admins', trimmedEmail));
            setIsAdmin(adminDoc.exists());
          } catch (error) {
            console.error('Failed to check admin access:', error);
            setIsAdmin(false);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
