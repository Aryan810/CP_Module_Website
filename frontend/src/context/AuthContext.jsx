import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigured } from '../firebase.js';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);     // { uid, email, ...profileDoc }
  const [fbUser, setFbUser] = useState(null); // raw firebase user, for getIdToken()
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firebaseConfigured) { setIsLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (!fu) { setUser(null); setFbUser(null); setIsLoading(false); return; }
      setFbUser(fu);
      try {
        const snap = await getDoc(doc(db, 'users', fu.uid));
        const profile = snap.exists() ? snap.data() : {};
        setUser({ uid: fu.uid, email: fu.email, ...profile });
      } catch (e) {
        console.error('Failed loading profile:', e);
        setUser({ uid: fu.uid, email: fu.email, role: 'user' });
      } finally {
        setIsLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = async ({ email, password }) => {
    if (!firebaseConfigured) throw new Error('Firebase not configured. See FIREBASE_SETUP.md.');
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  };

  const register = async ({ email, password, username, cfusername, name }) => {
    if (!firebaseConfigured) throw new Error('Firebase not configured. See FIREBASE_SETUP.md.');
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const profile = {
      username,
      email,
      cfusername,
      name: name || username,
      role: 'user',
      cfImageUrl: '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', res.user.uid), profile);
    setUser({ uid: res.user.uid, email, ...profile });
    return res.user;
  };

  const logout = async () => {
    if (firebaseConfigured) { try { await fbSignOut(auth); } catch (e) { console.error(e); } }
    setUser(null); setFbUser(null);
  };

  const refreshProfile = async () => {
    if (!fbUser) return;
    const snap = await getDoc(doc(db, 'users', fbUser.uid));
    if (snap.exists()) setUser({ uid: fbUser.uid, email: fbUser.email, ...snap.data() });
  };

  const getIdToken = async () => (fbUser ? fbUser.getIdToken() : null);

  return (
    <AuthContext.Provider value={{ user, fbUser, isLoading, login, register, logout, refreshProfile, getIdToken, firebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};
